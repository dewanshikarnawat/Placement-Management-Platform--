import React, { useState, useRef, useEffect } from 'react';
import { UserRole, UserProfile, Message, Application, Internship } from '../types';

interface MessagesViewProps {
  currentRole: UserRole;
  currentUser: UserProfile;
  messages: Message[];
  allUsers: UserProfile[];
  applications: Application[];
  internships: Internship[];
  onSendMessage: (
    receiverId: string, 
    subject: string, 
    content: string, 
    internshipId?: string, 
    internshipTitle?: string
  ) => void;
  onMarkRead: (msgId: string) => void;
  triggerToast: (title: string, text: string, type: 'success' | 'info' | 'error') => void;
}

export default function MessagesView({
  currentRole,
  currentUser,
  messages,
  allUsers,
  applications,
  internships,
  onSendMessage,
  onMarkRead,
  triggerToast
}: MessagesViewProps) {

  // Selected Thread ID
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  
  // Compose modal toggles
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // New Message compose state
  const [composeReceiverId, setComposeReceiverId] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeContent, setComposeContent] = useState('');
  const [composeInternshipId, setComposeInternshipId] = useState('');

  // Reply Draft state
  const [replyText, setReplyText] = useState('');

  // Search keyword filters
  const [searchWord, setSearchWord] = useState('');

  // Determine user messages scope
  const filteredMessages = messages.filter(msg => {
    const involvesMe = msg.senderId === currentUser.id || msg.receiverId === currentUser.id;
    const matchesSearch = 
      msg.subject.toLowerCase().includes(searchWord.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchWord.toLowerCase()) ||
      msg.senderName.toLowerCase().includes(searchWord.toLowerCase()) ||
      msg.receiverName.toLowerCase().includes(searchWord.toLowerCase());

    return involvesMe && matchesSearch;
  });

  // Helper to extract core listing title
  const getListingTitle = (msg: Message) => {
    if (msg.internshipTitle) return msg.internshipTitle;
    let subj = msg.subject;
    subj = subj.replace(/^Re:\s*/i, '');
    subj = subj.replace(/^Status Update:\s*/i, '');
    subj = subj.replace(/^Receipt:\s*Application for\s*/i, '');
    subj = subj.replace(/^Inquiry regarding\s*/i, '');
    return subj.trim();
  };

  // Group messages into threads
  const threadsMap: { [key: string]: Message[] } = {};
  filteredMessages.forEach(msg => {
    const studentId = msg.senderRole === 'Student' ? msg.senderId : msg.receiverId;
    const listingTitle = getListingTitle(msg);
    const threadKey = `${studentId}_${listingTitle}`;
    
    if (!threadsMap[threadKey]) {
      threadsMap[threadKey] = [];
    }
    threadsMap[threadKey].push(msg);
  });

  interface Thread {
    id: string;
    studentId: string;
    studentName: string;
    recruiterId: string;
    recruiterName: string;
    listingTitle: string;
    messages: Message[];
    latestMessage: Message;
    unread: boolean;
  }

  const threads: Thread[] = Object.keys(threadsMap).map(key => {
    const threadMsgs = [...threadsMap[key]].sort((a, b) => {
      const aTime = new Date(a.createdAt || a.timestamp).getTime();
      const bTime = new Date(b.createdAt || b.timestamp).getTime();
      return aTime - bTime;
    });
    
    const latestMessage = threadMsgs[threadMsgs.length - 1];
    
    const isStudentSender = latestMessage.senderRole === 'Student';
    const studentId = isStudentSender ? latestMessage.senderId : latestMessage.receiverId;
    const studentName = isStudentSender ? latestMessage.senderName : latestMessage.receiverName;
    const recruiterId = isStudentSender ? latestMessage.receiverId : latestMessage.senderId;
    const recruiterName = isStudentSender ? latestMessage.receiverName : latestMessage.senderName;
    const listingTitle = getListingTitle(latestMessage);

    // Unread check
    const hasUnread = threadMsgs.some(m => m.receiverId === currentUser.id && !m.read);

    return {
      id: key,
      studentId,
      studentName,
      recruiterId,
      recruiterName,
      listingTitle,
      messages: threadMsgs,
      latestMessage,
      unread: hasUnread
    };
  }).sort((a, b) => {
    const aTime = new Date(a.latestMessage.createdAt || a.latestMessage.timestamp).getTime();
    const bTime = new Date(b.latestMessage.createdAt || b.latestMessage.timestamp).getTime();
    return bTime - aTime; // Latest threads first
  });

  const activeThread = threads.find(t => t.id === selectedThreadId);

  // Mark all messages in thread as read on select
  useEffect(() => {
    if (!activeThread) return;
    activeThread.messages.forEach(msg => {
      if (msg.receiverId === currentUser.id && !msg.read) {
        onMarkRead(msg.id);
      }
    });
  }, [selectedThreadId, messages]);

  // Scroll chat thread to bottom
  const chatScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [selectedThreadId, activeThread?.messages.length]);

  // Compose Submit Sequence
  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeReceiverId || !composeSubject.trim() || !composeContent.trim()) {
      triggerToast('Validation Error', 'Please select a recipient and fill all message fields.', 'error');
      return;
    }

    let targetId: string | undefined = undefined;
    let targetTitle: string | undefined = undefined;
    
    if (composeInternshipId) {
      const foundInt = internships.find(i => i.id === composeInternshipId);
      if (foundInt) {
        targetId = foundInt.id;
        targetTitle = foundInt.title;
      } else {
        const foundApp = applications.find(a => a.internshipId === composeInternshipId);
        if (foundApp) {
          targetId = foundApp.internshipId;
          targetTitle = foundApp.internshipTitle;
        }
      }
    }

    onSendMessage(composeReceiverId, composeSubject, composeContent, targetId, targetTitle);
    setIsComposeOpen(false);
    
    // Reset Compose Box
    setComposeReceiverId('');
    setComposeSubject('');
    setComposeContent('');
    setComposeInternshipId('');
  };

  // Reply submit sequence
  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;

    const latestMsg = activeThread.latestMessage;
    
    const runningReceiverId = currentUser.id === activeThread.studentId 
      ? activeThread.recruiterId 
      : activeThread.studentId;

    const replySubject = latestMsg.subject.startsWith('Re:') 
      ? latestMsg.subject 
      : `Re: ${latestMsg.subject}`;

    const intId = latestMsg.internshipId;
    const intTitle = activeThread.listingTitle;

    onSendMessage(runningReceiverId, replySubject, replyText, intId, intTitle);
    setReplyText('');
  };

  // Selectable recipients
  const potentialRecipients = allUsers.filter(u => u.id !== currentUser.id);

  const studentApplications = applications.filter(a => a.studentId === currentUser.id);
  const companyListings = internships.filter(i => i.company.toLowerCase() === (currentUser.companyName || '').toLowerCase());
  const allListings = internships;

  return (
    <div className="space-y-6 fade-in-up">
      
      {/* Messages Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 text-left">
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] uppercase tracking-widest mb-1.5 animate-pulse">
            <i className="fa-solid fa-wand-magic-sparkles text-brand-600 text-xs" />
            <span className="ml-1">Interactive Communications</span>
          </div>
          <h1 className="text-2xl font-serif font-semibold text-slate-900 tracking-tight font-display">
            Inbox & Messages
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Dispatch queries, track recommendation summaries, and dialogue directly between roles.
          </p>
        </div>

        <button
          id="trigger-compose-msg-btn"
          onClick={() => setIsComposeOpen(true)}
          className="px-4 py-2 bg-slate-900 text-white border border-transparent rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-brand-600 cursor-pointer shadow transition-all self-start sm:self-auto select-none"
        >
          <i className="fa-solid fa-plus text-xs" />
          <span>New Message</span>
        </button>
      </div>

      {/* Grid: 12 Cols Divided for Master-Detail Inbox */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[72vh] items-stretch">
        
        {/* Left Side: Message threads summaries (5 grid cols) */}
        <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-start h-full overflow-hidden">
          
          {/* Thread Search Box */}
          <div className="relative mb-4 select-none">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              id="message-threads-search"
              type="text"
              placeholder="Search conversations..."
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 focus:border-brand-600 rounded-lg text-xs placeholder:text-slate-400 outline-hidden"
            />
          </div>

          {/* Threads Loop */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1" id="threads-container">
            {threads.length === 0 ? (
              <div className="text-center py-12 select-none">
                <i className="fa-solid fa-envelope text-slate-300 text-2xl mb-2 block" />
                <p className="text-xs text-slate-400 italic font-mono">No threads found.</p>
              </div>
            ) : (
              threads.map((thread) => {
                const isSelected = activeThread?.id === thread.id;
                const isUnread = thread.unread;
                const latestMsg = thread.latestMessage;
                const isOutgoing = latestMsg.senderId === currentUser.id;

                return (
                  <div
                    key={thread.id}
                    id={`message-thread-item-${thread.id}`}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-slate-200/80 border-slate-400 shadow-sm' 
                        : isUnread
                          ? 'bg-white border-slate-250 font-bold shadow-xs'
                          : 'bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-brand-650 shrink-0 animate-ping" />
                        )}
                        <span className="text-xs text-slate-700 font-semibold truncate max-w-[150px]">
                          {currentUser.role === 'Student' 
                            ? (isOutgoing ? `To: ${thread.recruiterName}` : thread.recruiterName)
                            : (isOutgoing ? `To: ${thread.studentName}` : thread.studentName)
                          }
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono shrink-0">{latestMsg.timestamp}</span>
                    </div>

                    <h4 className={`text-xs truncate font-serif ${isUnread ? 'text-slate-905 font-bold' : 'text-slate-700 font-medium'}`}>
                      {thread.listingTitle}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 leading-normal font-sans">
                      {isOutgoing ? 'You: ' : ''}{latestMsg.content}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-dashed border-slate-200 text-[9px] text-slate-400 font-mono uppercase">
                      <span>{thread.messages.length} messages</span>
                      <span className="text-[9px] text-brand-600 font-bold px-1.5 py-0.2 rounded-md bg-brand-600/5 lowercase italic select-none">
                        {currentUser.role === 'Student' ? 'company' : 'student'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Thread Reader (7 grid cols) */}
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between h-full overflow-hidden">
          {activeThread ? (
            <div className="flex flex-col h-full justify-between">
              
              {/* Header Context */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 text-left select-none">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
                  Thread Discussion
                </span>
                <h3 className="font-serif font-bold text-lg text-slate-900 leading-snug mt-0.5 font-display">
                  {activeThread.listingTitle}
                </h3>

                <div className="flex items-center gap-3.5 mt-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <i className="fa-solid fa-user text-slate-450 text-[11px]" />
                    <span className="font-semibold text-slate-700">{activeThread.studentName} (Student)</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className="font-semibold text-brand-600">
                    <i className="fa-solid fa-building text-[10px] mr-1" />
                    {activeThread.recruiterName} (Recruiter)
                  </span>
                </div>
              </div>

              {/* Message Scroll Body - Chronological Chat bubble logs */}
              <div ref={chatScrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 text-left" id="message-body-content">
                {activeThread.messages.map((msg) => {
                  const isOutgoing = msg.senderId === currentUser.id;
                  const isSystem = msg.senderId.startsWith('system-auto') || msg.id.startsWith('msg-auto') || msg.id.startsWith('msg-status') || msg.senderName.includes('Talent Team') || msg.senderName.includes('Recruiting Office');

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2 max-w-md mx-auto">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center space-y-2 w-full shadow-xs">
                          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block font-bold select-none">
                            Automated System Log • {msg.timestamp}
                          </span>
                          <h5 className="text-xs font-bold text-slate-905 font-serif leading-snug">{msg.subject}</h5>
                          <p className="text-[11px] leading-relaxed text-slate-550 whitespace-pre-line font-sans select-text">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} w-full`}
                    >
                      <div className={`max-w-[75%] rounded-2xl p-4 space-y-1.5 shadow-sm text-left border ${
                        isOutgoing
                          ? 'bg-indigo-600 text-white border-transparent'
                          : 'bg-slate-50 text-slate-900 border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between gap-4 select-none pb-0.5 border-b border-white/10">
                          <span className={`text-[10px] font-mono uppercase ${isOutgoing ? 'text-indigo-100' : 'text-brand-600'} font-bold`}>
                            {msg.senderName} ({msg.senderRole})
                          </span>
                          <span className={`text-[9px] font-mono ${isOutgoing ? 'text-indigo-200' : 'text-slate-405'}`}>
                            {msg.timestamp}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed whitespace-pre-line font-sans select-text">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Section Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-55 pr-5 select-none">
                <form onSubmit={handleReplySubmit} className="flex gap-2.5 items-end">
                  <textarea
                    id="message-reply-input"
                    rows={2}
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${currentUser.role === 'Student' ? activeThread.recruiterName : activeThread.studentName}...`}
                    className="flex-1 bg-white border border-slate-200 focus:border-brand-650 focus:ring-1 focus:ring-brand-600 rounded-xl p-3 text-xs resize-none outline-hidden"
                  />
                  <button
                    id="message-reply-submit-btn"
                    type="submit"
                    className="p-3 bg-slate-900 text-white hover:bg-brand-600 hover:scale-105 transition-all rounded-xl cursor-pointer shadow shrink-0 flex items-center justify-center h-10 w-10"
                    title="Send reply"
                  >
                    <i className="fa-solid fa-paper-plane text-sm" />
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-12 select-none">
              <i className="fa-solid fa-folder-open text-slate-300 text-4xl mb-3 animate-pulse block" />
              <h3 className="font-display font-medium text-base text-slate-900">No active thread selected</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-normal">
                Select an incoming message item from the sidebar summary lists, or compose a brand new message query sequence.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* COMPOSE NEW DIALOG MESSAGE DIALOG (MODAL) */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative">
            
            <button
              id="cancel-compose-modal"
              onClick={() => setIsComposeOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer select-none"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>

            <form onSubmit={handleComposeSubmit} className="space-y-4">
              
              <div className="border-b border-slate-200 pb-3 mb-4 text-left select-none">
                <span className="text-[10px] font-mono text-slate-450 uppercase tracking-widest block font-bold">Placera Dispatch Engine</span>
                <h3 className="font-serif font-bold text-lg text-slate-905 mt-0.5">
                  Compose New Message
                </h3>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 font-semibold select-none">Recipient Candidate/Coordinator *</label>
                <select
                  id="compose-receiver-select"
                  required
                  value={composeReceiverId}
                  onChange={(e) => setComposeReceiverId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs text-slate-900 cursor-pointer"
                >
                  <option value="">-- Choose recipient account --</option>
                  {potentialRecipients.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role === 'Company' ? `${u.companyName} Recruiter` : u.role})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 font-semibold select-none">Related Placement Listing (Optional)</label>
                <select
                  id="compose-internship-select"
                  value={composeInternshipId}
                  onChange={(e) => setComposeInternshipId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs text-slate-900 cursor-pointer"
                >
                  <option value="">-- General Discussion / None --</option>
                  {currentRole === 'Student' && studentApplications.map(a => (
                    <option key={a.internshipId} value={a.internshipId}>{a.internshipTitle} ({a.companyName})</option>
                  ))}
                  {currentRole === 'Company' && companyListings.map(i => (
                    <option key={i.id} value={i.id}>{i.title}</option>
                  ))}
                  {currentRole === 'Admin' && allListings.map(i => (
                    <option key={i.id} value={i.id}>{i.title} ({i.company})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 font-semibold select-none">Subject Query Line *</label>
                <input
                  id="compose-subject-input"
                  type="text"
                  required
                  placeholder="e.g. Inquiring regarding next step schedules"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-brand-650 px-3.5 py-2.5 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 font-semibold select-none">Message Content body *</label>
                <textarea
                  id="compose-content-textarea"
                  required
                  rows={5}
                  value={composeContent}
                  onChange={(e) => setComposeContent(e.target.value)}
                  placeholder="Draft your inquiries professionally. Contacts will receive emails instantly..."
                  className="w-full bg-white border border-slate-200 focus:border-brand-650 rounded-lg p-3 text-xs font-sans resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 mt-4 select-none">
                <button
                  type="button"
                  id="compose-modal-cancel"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="compose-modal-submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-brand-600 text-white rounded-lg text-xs font-bold cursor-pointer shadow flex items-center gap-1.5 transition-all"
                >
                  <span>Dispatch Message</span>
                  <i className="fa-solid fa-paper-plane text-[10px]" />
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
