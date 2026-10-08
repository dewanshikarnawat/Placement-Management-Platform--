import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { UserRole, UserProfile, Internship, Application } from '../types';
import { userService } from '../services/api';

interface ListingsViewProps {
  currentRole: UserRole;
  currentUser: UserProfile | null;
  internships: Internship[];
  applications: Application[];
  allUsers: UserProfile[];
  onAddListing: (listing: Internship) => void;
  onApply: (internshipId: string, coverLetter: string, resumeName: string) => void;
  triggerToast: (title: string, text: string, type: 'success' | 'info' | 'error') => void;
  listingsFilter: string;
  setListingsFilter: (filter: string) => void;
  onPromptAuth?: () => void;
  onDeleteListing: (listingId: string) => void;
  onFacultyReviewListing?: (listingId: string, status: 'Verified' | 'Unverified', remark?: string) => void;
  onFacultyVerifyRecruiter?: (recruiterId: string, status: 'Genuine' | 'Not Genuine', reason?: string) => void;
}

const renderMarkdown = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  
  let currentSection: 'list' | 'paragraph' | 'none' = 'none';
  const listItems: React.ReactNode[] = [];
  
  const flushList = (key: string | number) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`ul-${key}`} className="list-disc pl-4 mb-2 text-slate-700 space-y-1 text-left list-outside">
          {[...listItems]}
        </ul>
      );
      listItems.length = 0;
    }
  };

  const parseFormattedText = (str: string, keyPrefix: string): React.ReactNode[] => {
    const boldParts = str.split(/\*\*([^*]+)\*\*/g);
    return boldParts.flatMap((part, i) => {
      const isBold = i % 2 === 1;
      const codeParts = part.split(/`([^`]+)`/g);
      const nodes = codeParts.map((subpart, j) => {
        const isCode = j % 2 === 1;
        if (isCode) {
          return (
            <code key={`${keyPrefix}-${i}-${j}`} className="bg-slate-100 text-purple-750 font-mono px-1 py-0.5 rounded text-[10px]">
              {subpart}
            </code>
          );
        }
        return subpart;
      });

      if (isBold) {
        return <strong key={`${keyPrefix}-bold-${i}`} className="font-bold text-slate-900">{nodes}</strong>;
      }
      return nodes;
    });
  };

  const commonListSections = [
    'strong points',
    'gaps',
    'areas for improvement',
    'recommended updates',
    'areas for improvement & recommended updates'
  ];

  const commonHeaders = [
    'introduction',
    'strong points',
    'gaps',
    'areas for improvement',
    'recommended updates',
    'tailored bio recommendation',
    'biography recommendation',
    'recommended biography tailored to this role',
    'areas for improvement & recommended updates'
  ];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed === '') {
      flushList(index);
      currentSection = 'none';
      renderedElements.push(<div key={`empty-${index}`} className="h-2" />);
      return;
    }

    // Check if line is a header (either marked with # or matching common headers)
    let isHeader = false;
    let headerText = trimmed;
    let headerLevel = 3; // default h4

    if (trimmed.startsWith('# ')) {
      isHeader = true;
      headerText = trimmed.substring(2);
      headerLevel = 1;
    } else if (trimmed.startsWith('## ')) {
      isHeader = true;
      headerText = trimmed.substring(3);
      headerLevel = 2;
    } else if (trimmed.startsWith('### ')) {
      isHeader = true;
      headerText = trimmed.substring(4);
      headerLevel = 3;
    } else {
      // Clean up common symbols to check if it matches a known header
      const cleanLine = trimmed.replace(/^[#*\-\s:]+|[#*\-\s:]+$/g, '').trim();
      if (commonHeaders.includes(cleanLine.toLowerCase())) {
        isHeader = true;
        headerText = cleanLine;
        headerLevel = 3;
      }
    }

    if (isHeader) {
      flushList(index);
      
      const cleanHeaderText = headerText.replace(/:$/, '').trim(); // Remove trailing colon if present
      const key = `header-${index}`;
      
      if (commonListSections.includes(cleanHeaderText.toLowerCase())) {
        currentSection = 'list';
      } else {
        currentSection = 'paragraph';
      }

      if (headerLevel === 1) {
        renderedElements.push(
          <h2 key={key} className="text-base font-bold text-purple-950 mt-5 mb-1.5 text-left border-b border-purple-100 pb-0.5">
            {parseFormattedText(cleanHeaderText, key)}
          </h2>
        );
      } else if (headerLevel === 2) {
        renderedElements.push(
          <h3 key={key} className="text-sm font-semibold text-purple-950 mt-4 mb-1 border-b border-purple-100 pb-0.5 text-left">
            {parseFormattedText(cleanHeaderText, key)}
          </h3>
        );
      } else {
        renderedElements.push(
          <h4 key={key} className="text-xs font-mono font-bold text-purple-900 mt-3 mb-1 uppercase tracking-wide text-left">
            {parseFormattedText(cleanHeaderText, key)}
          </h4>
        );
      }
      return;
    }

    // It's a regular content line. Check if it's a list item.
    let isListItem = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ');
    let itemText = trimmed;
    if (isListItem) {
      itemText = trimmed.replace(/^[*\-•\s]+/, '');
    } else if (currentSection === 'list') {
      isListItem = true;
    }

    const key = `line-${index}`;
    if (isListItem) {
      listItems.push(
        <li key={`li-${index}`} className="text-xs text-slate-700 leading-relaxed text-left ml-1.5">
          {parseFormattedText(itemText, key)}
        </li>
      );
    } else {
      flushList(index);
      renderedElements.push(
        <p key={key} className="text-xs text-slate-700 leading-relaxed mb-1.5 text-left">
          {parseFormattedText(line, key)}
        </p>
      );
    }
  });

  flushList('final');
  return <div className="space-y-1 w-full font-sans">{renderedElements}</div>;
};

export default function ListingsView({
  currentRole,
  currentUser,
  internships,
  applications,
  allUsers,
  onAddListing,
  onApply,
  triggerToast,
  listingsFilter,
  setListingsFilter,
  onPromptAuth,
  onDeleteListing,
  onFacultyReviewListing,
  onFacultyVerifyRecruiter
}: ListingsViewProps) {

  // Search & Tag Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Selected Listing for "View Detail Drawer"
  const [selectedListing, setSelectedListing] = useState<Internship | null>(null);

  // Modals Controller
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Instant One-Click Job Application Flow
  const handleQuickApply = async (listing: Internship) => {
    if (!currentUser) return;
    if (!currentUser.resumeName) {
      triggerToast(
        'Resume Needed', 
        'Please upload a verified PDF resume in your Profile configurations first to activate One-Click Apply.', 
        'error'
      );
      return;
    }
    
    // Evaluate match score before permitting quick application
    let score = aiMatchScore;
    if (score === null) {
      triggerToast('AI Auditing', 'Evaluating your qualifications for quick apply...', 'info');
      try {
        const data = await userService.auditMatch(currentUser.id, listing.id);
        if (data.success) {
          score = data.matchScore;
          setAiMatchScore(data.matchScore);
          setAiAuditResult(data.auditText);
          setAiStrongPoints(data.strongPoints || null);
          setAiGaps(data.gaps || null);
          setAiBioRecommendation(data.bioRecommendation || null);
          setHasCheckedEligibility(true);
        }
      } catch (err) {
        console.error("Quick apply matching audit failed:", err);
      }
    }
    
    if (score !== null && score < 60) {
      triggerToast(
        'Application Blocked', 
        `Your AI Match Score (${score}%) is below the required 60% threshold. Please update your profile skills/bio first.`, 
        'error'
      );
      return;
    }
    
    onApply(listing.id, "Applied via One-Click Quick Apply.", currentUser.resumeName);
    setSelectedListing(null); // Close sidebar details smoothly
  };

  // Multi-step Application Form State
  const [applyStep, setApplyStep] = useState(1);
  const [coverLetterText, setCoverLetterText] = useState('');
  const [selectedResumeName, setSelectedResumeName] = useState(currentUser?.resumeName || '');

  // AI Matching Audit states
  const [aiAuditResult, setAiAuditResult] = useState<string | null>(null);
  const [aiMatchScore, setAiMatchScore] = useState<number | null>(null);
  const [aiStrongPoints, setAiStrongPoints] = useState<string | null>(null);
  const [aiGaps, setAiGaps] = useState<string | null>(null);
  const [aiBioRecommendation, setAiBioRecommendation] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [hasCheckedEligibility, setHasCheckedEligibility] = useState(false);

  useEffect(() => {
    setHasCheckedEligibility(false);
    setAiAuditResult(null);
    setAiMatchScore(null);
    setAiStrongPoints(null);
    setAiGaps(null);
    setAiBioRecommendation(null);
  }, [selectedListing]);

  const handleCopyBio = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerToast('Bio Copied', 'Suggested biography copied to clipboard. Paste it in your Profile configurations!', 'success');
  };

  const handleRunEligibilityCheck = async () => {
    if (!currentUser || !selectedListing) return;
    setIsAuditing(true);
    setAiAuditResult(null);
    setAiMatchScore(null);
    setAiStrongPoints(null);
    setAiGaps(null);
    setAiBioRecommendation(null);
    try {
      const data = await userService.auditMatch(currentUser.id, selectedListing.id);
      if (data.success) {
        setAiAuditResult(data.auditText);
        setAiMatchScore(data.matchScore);
        setAiStrongPoints(data.strongPoints || null);
        setAiGaps(data.gaps || null);
        setAiBioRecommendation(data.bioRecommendation || null);
        setHasCheckedEligibility(true);
      } else {
        setAiAuditResult("AI Audit could not evaluate coordinates.");
        setAiMatchScore(null);
      }
    } catch (err) {
      console.error("AI Audit error:", err);
      setAiAuditResult("Connection to AI coordination engine interrupted.");
      setAiMatchScore(null);
    } finally {
      setIsAuditing(false);
    }
  };

  // Post New Listing Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState(currentUser?.companyName || 'University Sponsor');
  const [newLocation, setNewLocation] = useState('Remote');
  const [newStipend, setNewStipend] = useState('$40 / hr');
  const [newDeadline, setNewDeadline] = useState('June 30, 2026');
  const [newCategory, setNewCategory] = useState<'Engineering' | 'Design' | 'Product' | 'Marketing'>('Engineering');
  const [newDescription, setNewDescription] = useState('');
  const [newRequirements, setNewRequirements] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [listingReviewRemarkDraft, setListingReviewRemarkDraft] = useState('');

  // Dynamically sync forms once currentUser session loads
  useEffect(() => {
    if (currentUser?.companyName) {
      setNewCompany(currentUser.companyName);
    }
    if (currentUser?.resumeName) {
      setSelectedResumeName(currentUser.resumeName);
    }
  }, [currentUser]);

  // Autofill listing generator
  const handleAutofill = () => {
    const mockJobs = [
      {
        title: 'Full Stack Engineer (Placement)',
        company: 'Vercel',
        category: 'Engineering' as const,
        location: 'Remote (US/Canada)',
        stipend: '$55 / hr',
        deadline: 'July 15, 2026',
        description: 'We are seeking an outstanding Full Stack Systems Engineer to work on Next.js core features, developer experience tooling, and serverless edge rendering optimizations. You will collaborate closely with frameworks and infrastructure teams.',
        requirements: 'Enrolled in Computer Science or equivalent major\nStrong experience with React, TypeScript, and Node.js\nFamiliarity with serverless and edge compute paradigms\nGreat communication and problem-solving skills',
        skills: 'React, Next.js, TypeScript, Node.js, WebAssembly'
      },
      {
        title: 'Interaction Designer (Placement)',
        company: 'Linear',
        category: 'Design' as const,
        location: 'Hybrid (San Francisco, CA)',
        stipend: '$5,500 / mo',
        deadline: 'July 20, 2026',
        description: 'Help shape the future of issue tracking. As a design placement candidate at Linear, you will work on crafting high-fidelity layouts, advanced SVG keyboard navigations, and fluid interface micro-animations.',
        requirements: 'Comprehensive portfolio showcasing elegant product UI design\nStrong proficiency in Figma and prototyping tools\nDeep appreciation for typography, space, grids, and aesthetics\nFamiliarity with frontend technologies is a plus',
        skills: 'Figma, UI/UX, Motion Design, Prototyping'
      },
      {
        title: 'Technical Product Manager (Placement)',
        company: 'Stripe',
        category: 'Product' as const,
        location: 'Remote (Global)',
        stipend: '$6,500 / mo',
        deadline: 'July 25, 2026',
        description: 'Join the Stripe developer experience team. You will lead telemetry research, draft developer product PRDs, coordinate API design sprint structures, and design payment checkout onboarding funnels.',
        requirements: 'Technical background (CS or software engineering projects)\nExcellent analytical and data metrics synthesis skills\nEmpathetic mindset for developer tooling and pain-points\nStrong collaborative narrative writing',
        skills: 'Product Planning, SQL, Developer APIs, Funnel Analytics'
      }
    ];

    const randomJob = mockJobs[Math.floor(Math.random() * mockJobs.length)];
    setNewTitle(randomJob.title);
    setNewCompany(currentUser?.companyName || randomJob.company);
    setNewCategory(randomJob.category);
    setNewLocation(randomJob.location);
    setNewStipend(randomJob.stipend);
    setNewDeadline(randomJob.deadline);
    setNewDescription(randomJob.description);
    setNewRequirements(randomJob.requirements);
    setNewSkills(randomJob.skills);

    triggerToast('Form Autofilled', `Populated the form with a mockup placement listing for ${randomJob.company}!`, 'info');
  };

  // Filtering Logic
  const categories = ['All', 'Engineering', 'Design', 'Product', 'Marketing'];

  const filteredListings = internships.filter(listing => {
    const matchesCategory = selectedCategory === 'All' || listing.category === selectedCategory;
    const matchesSearch = 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Switch filter from sidebar or helper buttons
    if (listingsFilter === 'my_company' && currentRole === 'Company') {
      return matchesCategory && matchesSearch && listing.company.toLowerCase() === (currentUser.companyName || 'Linear').toLowerCase();
    }

    return matchesCategory && matchesSearch;
  });

  // Check if student has already applied to a listing
  const hasApplied = (listingId: string) => {
    if (!currentUser) return false;
    return applications.some(a => a.studentId === currentUser.id && a.internshipId === listingId);
  };

  // Submit Application Integration
  const handleApplySubmit = () => {
    if (!selectedListing) return;
    onApply(selectedListing.id, coverLetterText, selectedResumeName);
    setIsApplyModalOpen(false);
    setApplyStep(1);
    setCoverLetterText('');
    setSelectedListing(null);
  };

  // Submit Post Integration
  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) {
      triggerToast('Incomplete fields', 'Please enter a title & listing description.', 'error');
      return;
    }

    const reqsArray = newRequirements
      ? newRequirements.split('\n').filter(r => r.trim() !== '')
      : ['Prior experience in relevant technology stack', 'Excellent communicative and writing abilities'];

    const skillsArray = newSkills
      ? newSkills.split(',').map(s => s.trim()).filter(s => s !== '')
      : ['TypeScript', 'Team Collaboration'];

    // Generate random background colors
    const logoColors = [
      'bg-slate-900 text-white',
      'bg-indigo-950 text-white',
      'bg-emerald-850 text-white font-semibold',
      'bg-brand-600 text-white',
      'bg-zinc-800 text-white font-mono'
    ];
    const randomLogoBg = logoColors[Math.floor(Math.random() * logoColors.length)];

    const newListingItem: Internship = {
      id: `intern-${Date.now()}`,
      title: newTitle,
      company: newCompany,
      location: newLocation,
      stipend: newStipend,
      deadline: newDeadline,
      description: newDescription,
      requirements: reqsArray,
      skills: skillsArray,
      category: newCategory,
      logoBg: randomLogoBg,
      postedDate: 'Today'
    };

    onAddListing(newListingItem);
    setIsPostModalOpen(false);
    
    // Reset Form
    setNewTitle('');
    setNewDescription('');
    setNewRequirements('');
    setNewSkills('');
  };

  return (
    <div className="space-y-6 fade-in-up">
      
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex-1 max-w-lg relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            id="listings-search-input"
            type="text"
            placeholder="Search placements, skill keywords, or enterprise companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 rounded-xl text-xs placeholder:text-slate-400 transition-colors font-sans text-slate-900"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-2 select-none">
          {categories.map((cat) => (
            <button
              id={`category-filter-${cat}`}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-905 hover:border-brand-600'
              }`}
            >
              {cat}
            </button>
          ))}

          {/* Recruiter "Post" Shortcut */}
          {(currentRole === 'Company' || currentRole === 'Admin') && (
            <button
              id="post-listing-trigger"
              onClick={() => setIsPostModalOpen(true)}
              className="px-4 py-1.5 bg-slate-900 text-white border border-slate-900 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-brand-600 hover:border-brand-600 cursor-pointer shadow-sm ml-auto md:ml-2 transition-all"
            >
              <i className="fa-solid fa-plus text-xs" />
              <span>Post Placement</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid & Side Detail split (Asymmetric Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
        
        {/* Left Side: listings list (8 grid cols if detail open, 12 if closed) */}
        <div className={`${selectedListing ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          {filteredListings.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto">
              <i className="fa-solid fa-circle-info text-2xl text-slate-400 mb-3 block" />
              <h3 className="font-serif font-semibold text-lg text-slate-900 font-display">No placement opportunities match filters</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-2.5 leading-relaxed">
                Check other skill tags or switch your filter context at the top to display alternative categories.
              </p>
              <button
                id="reset-listings-query-btn"
                onClick={() => {setSelectedCategory('All'); setSearchQuery('');}}
                className="mt-4 text-xs font-bold text-brand-600 hover:bg-slate-50 cursor-pointer border border-slate-200 px-3.5 py-1.5 rounded-lg"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${selectedListing ? 'md:grid-cols-1' : 'md:grid-cols-2 xl:grid-cols-3'} gap-4`}>
              {filteredListings.map((listing) => {
                const alreadyApplied = hasApplied(listing.id);
                const isSelected = selectedListing?.id === listing.id;

                return (
                  <div
                    key={listing.id}
                    id={`internship-card-${listing.id}`}
                    onClick={() => setSelectedListing(listing)}
                    className={`bg-white border rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected 
                        ? 'border-brand-650 ring-1 ring-brand-600/30' 
                        : 'border-slate-200 hover:border-brand-600/40'
                    }`}
                  >
                    <div>
                      {/* Logo header */}
                      <div className="flex items-start justify-between pb-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center font-serif text-sm font-semibold text-white shadow-inner ${listing.logoBg}`}>
                            {listing.company.charAt(0)}
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none block">
                              {listing.company}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="inline-block h-1.5 w-1.5 bg-brand-600 rounded-full animate-pulse" />
                              <span className="text-[10px] text-slate-500 font-mono italic">{listing.category}</span>
                            </div>
                          </div>
                        </div>

                        {alreadyApplied && (
                          <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-250 py-0.5 px-2 rounded-full font-mono">
                            Applied ✓
                          </span>
                        )}
                      </div>

                      {/* Job Info */}
                      <div className="space-y-1 mt-2 text-left">
                        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug font-sans">
                          {listing.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-sans line-clamp-2 mt-1">
                          {listing.description}
                        </p>
                      </div>

                      {/* Skills badges */}
                      <div className="flex flex-wrap gap-1 mt-4">
                        {listing.skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="text-[9px] font-mono bg-slate-50 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                        {listing.skills.length > 3 && (
                          <span className="text-[8px] font-mono text-slate-400 px-1 py-0.5">
                            +{listing.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-dashed border-slate-100 text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-map-pin text-[9px]" /> {listing.location}
                      </span>
                      <span className="font-semibold text-slate-900">{listing.stipend}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Opportunity Detail Panel (5 grid cols) */}
        {selectedListing && (
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 relative sticky top-24 animate-fadeIn">
            
            {/* Close details button */}
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Close details panel"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>

            {/* Top Identity Block */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-200">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-serif text-lg font-bold text-white shadow-md ${selectedListing.logoBg}`}>
                {selectedListing.company.charAt(0)}
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none block">
                  {selectedListing.company}
                </span>
                <h3 className="font-serif font-semibold text-base text-slate-900 mt-1 leading-snug font-display">
                  {selectedListing.title}
                </h3>
              </div>
            </div>

            {/* Quick specifications grid */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
              <div className="space-y-0.5 text-left">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-semibold">Location Strategy</span>
                <p className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                  <i className="fa-solid fa-map-pin text-slate-400 text-[10px]" />
                  <span className="ml-0.5">{selectedListing.location}</span>
                </p>
              </div>
              <div className="space-y-0.5 text-left">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-semibold">Hourly/Monthly compensation</span>
                <p className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                  <i className="fa-solid fa-wallet text-slate-400 text-[10px]" />
                  <span className="ml-0.5">{selectedListing.stipend}</span>
                </p>
              </div>
              <div className="space-y-0.5 text-left">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-semibold">Closing Date</span>
                <p className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                  <i className="fa-solid fa-calendar-days text-amber-500 text-[10px]" />
                  <span className="ml-0.5">{selectedListing.deadline}</span>
                </p>
              </div>
              <div className="space-y-0.5 text-left">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-semibold">Department</span>
                <p className="text-xs font-semibold text-brand-600">
                  {selectedListing.category} (Division)
                </p>
              </div>
            </div>

            {/* About the role */}
            <div className="space-y-2 text-left">
              <h4 className="text-xs font-mono uppercase tracking-widest text-slate-450 font-bold">About the role</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans select-text">
                {selectedListing.description}
              </p>
            </div>

            {/* Ideal Candidate Requirements list */}
            <div className="space-y-2.5 text-left">
              <h4 className="text-xs font-mono uppercase tracking-widest text-slate-450 font-bold">Prerequisites</h4>
              <ul className="space-y-1.5">
                {selectedListing.requirements.map((req, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
                    <span className="text-brand-600 font-bold mt-0.5 shrink-0">•</span>
                    <span className="select-text">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Associated technologies */}
            <div className="space-y-2 text-left">
              <h4 className="text-xs font-mono uppercase tracking-widest text-slate-455 font-bold">Expected Tech Stacks</h4>
              <div className="flex flex-wrap gap-1.5 select-none">
                {selectedListing.skills.map(skill => (
                  <span key={skill} className="text-xs bg-slate-50 text-brand-600 px-2.5 py-1 rounded-md font-mono border border-slate-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {currentRole === 'Faculty' && (
              <div className="space-y-2.5 pt-4 border-t border-slate-200 text-left">
                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-450 font-bold">Company Recruiter Verification</h4>
                <div className="space-y-2 pt-2">
                  {allUsers
                    .filter(
                      (u) =>
                        u.role === 'Company' &&
                        (u.companyName || '').toLowerCase() === selectedListing.company.toLowerCase()
                    )
                    .map((recruiter) => (
                      <div key={recruiter.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <p className="text-xs font-semibold text-slate-900">
                          {recruiter.name} ({recruiter.companyName})
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Status: <span className="font-semibold">{recruiter.recruiterVerificationStatus || 'Pending'}</span>
                        </p>
                        {recruiter.recruiterVerificationStatus === 'Not Genuine' && recruiter.recruiterVerificationReason && (
                          <p className="text-[10px] text-rose-700 bg-rose-50 p-1.5 rounded">Reason: {recruiter.recruiterVerificationReason}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => onFacultyVerifyRecruiter?.(recruiter.id, 'Genuine')}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700 cursor-pointer"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => {
                              if (!listingReviewRemarkDraft.trim()) {
                                triggerToast('Reason Required', 'Please add reason/remark before rejecting recruiter.', 'error');
                                return;
                              }
                              onFacultyVerifyRecruiter?.(recruiter.id, 'Not Genuine', listingReviewRemarkDraft);
                            }}
                            className="px-2.5 py-1 bg-rose-600 text-white rounded text-[11px] font-semibold hover:bg-rose-700 cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  {allUsers.filter(
                    (u) =>
                      u.role === 'Company' &&
                      (u.companyName || '').toLowerCase() === selectedListing.company.toLowerCase()
                  ).length === 0 && (
                    <p className="text-xs text-slate-500 italic">No recruiters found for this company.</p>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={listingReviewRemarkDraft}
                  onChange={(e) => setListingReviewRemarkDraft(e.target.value)}
                  placeholder="Reason/remark to use when rejecting recruiter"
                  className="w-full text-xs font-sans p-2 rounded-lg bg-white border border-slate-200 resize-none mt-2"
                />
              </div>
            )}

            {/* Vetted Candidates list (Visible only to listings owner recruiters or admins) */}
            {(currentRole === 'Admin' || (currentRole === 'Company' && currentUser?.companyName?.toLowerCase() === selectedListing.company.toLowerCase())) && (
              <div className="space-y-3 pt-4 border-t border-slate-200 text-left">
                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-450 font-bold flex justify-between select-none">
                  <span>Vetted Candidates ({applications.filter(a => a.internshipId === selectedListing.id).length})</span>
                  <span className="text-brand-600 font-sans normal-case font-semibold">Real-time status</span>
                </h4>
                
                {applications.filter(a => a.internshipId === selectedListing.id).length === 0 ? (
                  <p className="text-xs text-slate-500 italic pr-2 text-left select-none">No student applicants have registered dossiers for this listing yet.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {applications.filter(a => a.internshipId === selectedListing.id).map((app) => (
                      <div key={app.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:border-brand-600/40 transition-colors">
                        <div className="min-w-0 text-left">
                          <p className="text-xs font-semibold text-slate-900 truncate">{app.studentName}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{app.studentEmail}</p>
                        </div>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold border shrink-0 select-none ${
                          app.status === 'Offer' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          app.status === 'Interview' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          app.status === 'Shortlisted' ? 'bg-indigo-50 text-indigo-850 border-indigo-200' :
                          app.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentUser && currentRole === 'Student' && !hasApplied(selectedListing.id) && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-left space-y-2.5">
                <div className="flex items-center gap-2 text-purple-800 font-bold select-none text-[11px] uppercase tracking-wider font-mono">
                  <i className="fa-solid fa-wand-magic-sparkles animate-pulse text-purple-650 text-xs" />
                  <span>AI Placement Advisor (SPSU SmartMatch)</span>
                </div>

                {!hasCheckedEligibility && !isAuditing ? (
                  <div className="py-4 flex flex-col items-center justify-center border border-purple-200 bg-white rounded-xl text-center space-y-2.5 p-3">
                    <i className="fa-solid fa-wand-magic-sparkles text-xl text-purple-500 animate-bounce" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800">Run SPSU SmartMatch Eligibility Review</h4>
                      <p className="text-[10px] text-slate-500 max-w-sm">
                        AI will analyze your biography, technical skill-sets, GPAs, and certs against the listing requirements.
                      </p>
                    </div>
                    <button
                      onClick={handleRunEligibilityCheck}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-clipboard-question" />
                      <span>Check Eligibility</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {aiMatchScore !== null && (
                      <div className="space-y-3 mt-1.5">
                        {/* Score Banner */}
                        <div className={`p-3 rounded-xl border flex items-center justify-between font-sans ${
                          aiMatchScore >= 60
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                            : 'bg-rose-50/80 border-rose-200 text-rose-800'
                        }`}>
                          <div className="text-left">
                            <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-slate-400 block">AI Match Score</span>
                            <span className="text-[11px] font-sans font-semibold">
                              {aiMatchScore >= 60 ? 'Placement Criteria Met ✓' : 'Threshold Score Deficit ✗'}
                            </span>
                          </div>
                          <div className="text-right flex items-baseline gap-0.5">
                            <span className="text-xl font-bold font-mono leading-none">{aiMatchScore}</span>
                            <span className="text-[10px] font-bold font-mono text-slate-400">%</span>
                          </div>
                        </div>

                        {/* Strong Points */}
                        {aiStrongPoints && (
                          <div className="p-3 bg-emerald-50/30 border border-emerald-100/70 rounded-xl text-left space-y-1">
                            <h5 className="text-[9px] font-mono uppercase tracking-wider font-bold text-emerald-800 flex items-center gap-1">
                              <i className="fa-solid fa-circle-check text-[10px]" />
                              <span>Strong Assets</span>
                            </h5>
                            <div className="text-[11px] text-emerald-950 leading-relaxed pl-0.5">
                              {renderMarkdown(aiStrongPoints)}
                            </div>
                          </div>
                        )}

                        {/* Gaps */}
                        {aiGaps && (
                          <div className={`p-3 rounded-xl border text-left space-y-1 ${
                            aiMatchScore >= 60 ? 'bg-amber-50/30 border-amber-100' : 'bg-rose-50/30 border-rose-100'
                          }`}>
                            <h5 className={`text-[9px] font-mono uppercase tracking-wider font-bold flex items-center gap-1 ${
                              aiMatchScore >= 60 ? 'text-amber-800' : 'text-rose-800'
                            }`}>
                              <i className="fa-solid fa-triangle-exclamation text-[10px]" />
                              <span>Identified Gaps & Critique</span>
                            </h5>
                            <div className={`text-[11px] leading-relaxed pl-0.5 ${
                              aiMatchScore >= 60 ? 'text-amber-950' : 'text-rose-950'
                            }`}>
                              {renderMarkdown(aiGaps)}
                            </div>
                          </div>
                        )}

                        {/* Bio Recommendation */}
                        {aiBioRecommendation && (
                          <div className="p-3 bg-purple-50/30 border border-purple-100 rounded-xl text-left space-y-2 relative group">
                            <div className="flex items-center justify-between select-none">
                              <h5 className="text-[9px] font-mono uppercase tracking-wider font-bold text-purple-800 flex items-center gap-1">
                                <i className="fa-solid fa-wand-magic-sparkles text-[10px]" />
                                <span>Suggested Bio Tailoring</span>
                              </h5>
                              <button
                                onClick={() => handleCopyBio(aiBioRecommendation)}
                                className="px-2 py-0.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-[9px] font-mono font-bold transition-all hover:scale-105 cursor-pointer flex items-center gap-1"
                                title="Copy bio to clipboard"
                              >
                                <i className="fa-solid fa-copy text-[8px]" />
                                <span>Copy</span>
                              </button>
                            </div>
                            <div className="text-[11px] text-purple-955 leading-relaxed font-sans italic pl-1 border-l-2 border-purple-200 py-0.5 select-text">
                              {aiBioRecommendation.replace(/^["']|["']$/g, '')}
                            </div>
                          </div>
                        )}

                        {/* Fallback to raw result if sections are not set */}
                        {!aiStrongPoints && !aiGaps && aiAuditResult && (
                          <div className="text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto pr-1 select-text font-sans mt-2">
                            {renderMarkdown(aiAuditResult)}
                          </div>
                        )}
                      </div>
                    )}

                    {isAuditing && (
                      <div className="flex items-center gap-2.5 py-3 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                        <i className="fa-solid fa-spinner fa-spin text-purple-600 text-sm" />
                        <span>Analyzing profile credentials...</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Primary Action Button (Apply Modal Trigger) */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-2.5 items-center justify-between w-full select-none">
              {!currentUser ? (
                <button
                  onClick={() => {
                    if (onPromptAuth) onPromptAuth();
                  }}
                  className="w-full py-2.5 bg-slate-900 text-white hover:bg-brand-600 rounded-xl text-xs font-bold text-center cursor-pointer shadow transition-all flex items-center justify-center gap-1.5"
                >
                  <i className="fa-solid fa-wand-magic-sparkles text-brand-100 animate-pulse text-[11px]" />
                  Sign In to Apply Now
                </button>
              ) : currentRole === 'Student' ? (
                hasApplied(selectedListing.id) ? (
                  <button
                    disabled
                    className="w-full py-2.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 select-none"
                  >
                    <i className="fa-solid fa-circle-check text-emerald-600" />
                    <span>Application Submitted Successfully</span>
                  </button>
                ) : (
                  <div className="w-full flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between w-full">
                      <button
                        id="trigger-quick-apply-btn"
                        disabled={!hasCheckedEligibility || aiMatchScore === null || aiMatchScore < 60}
                        onClick={() => handleQuickApply(selectedListing)}
                        className={`w-full sm:w-1/2 py-2.5 rounded-xl text-xs font-bold text-center cursor-pointer shadow transition-all flex items-center justify-center gap-1.5 ${
                          !hasCheckedEligibility || aiMatchScore === null || aiMatchScore < 60
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <i className="fa-solid fa-bolt text-xs animate-pulse" />
                        One-Click Apply
                      </button>
                      <button
                        id="trigger-apply-now-btn"
                        disabled={!hasCheckedEligibility || aiMatchScore === null || aiMatchScore < 60}
                        onClick={() => {
                          setIsApplyModalOpen(true);
                          setApplyStep(1);
                        }}
                        className={`w-full sm:w-1/2 py-2.5 rounded-xl text-xs font-bold text-center cursor-pointer shadow transition-all flex items-center justify-center gap-1 ${
                          !hasCheckedEligibility || aiMatchScore === null || aiMatchScore < 60
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                            : 'bg-slate-900 hover:bg-brand-600 text-white'
                        }`}
                      >
                        Standard Apply <i className="fa-solid fa-chevron-right text-[10px] ml-1" />
                      </button>
                    </div>
                    {(!hasCheckedEligibility || aiMatchScore === null || aiMatchScore < 60) && (
                      <p className="text-[10px] text-center text-slate-500 italic mt-1 w-full">
                        Please verify your placement eligibility above to unlock apply options.
                      </p>
                    )}
                  </div>
                )
              ) : (
                (currentRole === 'Admin' || (currentRole === 'Company' && currentUser?.companyName?.toLowerCase() === selectedListing.company.toLowerCase())) ? (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to close and delete this placement opportunity? This action is permanent.')) {
                        onDeleteListing(selectedListing.id);
                        setSelectedListing(null); // Close sidebar smoothly
                      }
                    }}
                    className="w-full py-2.5 bg-red-50 hover:bg-red-650 text-red-600 hover:text-white border border-red-200 hover:border-transparent rounded-xl text-xs font-bold text-center cursor-pointer transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    Close & Delete Listing
                  </button>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 font-sans w-full text-center italic border border-slate-200">
                    Viewing in {currentRole} recruiter mode. Candidate credentials apply here.
                  </div>
                )
              )}
            </div>

          </div>
        )}
      </div>

      {/* MULTI_STEP APPLICATION MODAL */}
      {isApplyModalOpen && selectedListing && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 relative animate-fadeInUp">
            
            <button
              id="cancel-apply-modal"
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-55 transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>

            {/* Step trackers */}
            <div className="flex items-center gap-2 mb-6 select-none">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex-1 flex items-center gap-1">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-mono leading-none ${
                    applyStep === step 
                      ? 'bg-slate-900 text-white font-bold' 
                      : applyStep > step 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    {applyStep > step ? <i className="fa-solid fa-check text-[8px]" /> : step}
                  </div>
                  <span className={`text-[10px] font-mono uppercase tracking-wider hidden sm:inline ${
                    applyStep === step ? 'text-slate-900 font-bold' : 'text-slate-400'
                  }`}>
                    {step === 1 && 'Applicant'}
                    {step === 2 && 'Proposal Pitch'}
                    {step === 3 && 'Double Check'}
                  </span>
                  {step < 3 && <div className="h-px bg-slate-200 flex-1 ml-1" />}
                </div>
              ))}
            </div>

            <div className="border-b border-slate-200 pb-4 mb-5 text-left">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                Multi-step Application Wizard
              </span>
              <h3 className="font-display font-medium text-lg text-slate-900">
                Applying to {selectedListing.company}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedListing.title}</p>
            </div>

            {/* STEPS ROUTING */}
            {applyStep === 1 && currentUser && (
              <div className="space-y-4">
                <div className="p-3 bg-indigo-50/15 border border-indigo-500/10 rounded-xl flex items-center gap-2.5">
                  <i className="fa-solid fa-user-check text-brand-600 text-sm" />
                  <p className="text-xs text-slate-650 leading-normal text-left">
                    We will fetch your verified profile attributes automatically to speed up recruiter vetting. Update them anytime in <strong>My Documents</strong>.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 font-semibold">Student Applicant</label>
                    <input type="text" disabled value={currentUser.name} className="w-full bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-lg text-slate-600 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 font-semibold">College Major / University</label>
                    <input type="text" disabled value={currentUser.college || 'Stanford'} className="w-full bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-lg text-slate-600 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 font-semibold">Contact Email</label>
                    <input type="text" disabled value={currentUser.email} className="w-full bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-lg text-slate-600 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 font-semibold">Resume PDF Dossier</label>
                    <div className="w-full bg-slate-150/50 border border-slate-200 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-900 flex items-center justify-between">
                      <span className="truncate">{selectedResumeName || 'No resume uploaded'}</span>
                      <span className="text-emerald-600 text-[10px] font-mono shrink-0 ml-1">Verified ✓</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 select-none">
                  <button
                    onClick={() => setApplyStep(2)}
                    className="px-5 py-2 bg-slate-900 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Proceed to Pitch</span>
                    <i className="fa-solid fa-arrow-right text-[10px]" />
                  </button>
                </div>
              </div>
            )}

            {applyStep === 2 && (
              <div className="space-y-4">
                {/* AI Advisor Panel */}
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-left space-y-2.5">
                  <div className="flex items-center gap-2 text-purple-800 font-bold select-none text-[11px] uppercase tracking-wider font-mono">
                    <i className="fa-solid fa-wand-magic-sparkles animate-pulse text-purple-650 text-xs" />
                    <span>AI Placement Advisor (SPSU SmartMatch)</span>
                  </div>

                  {!hasCheckedEligibility && !isAuditing ? (
                    <div className="py-6 flex flex-col items-center justify-center border border-purple-200 bg-white rounded-xl text-center space-y-3 p-4">
                      <i className="fa-solid fa-wand-magic-sparkles text-2xl text-purple-500 animate-bounce" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800">Run SPSU SmartMatch Eligibility Review</h4>
                        <p className="text-[10px] text-slate-500 max-w-sm">
                          AI will analyze your biography, technical skill-sets, GPAs, and certs against the listing requirements.
                        </p>
                      </div>
                      <button
                        onClick={handleRunEligibilityCheck}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-clipboard-question" />
                        <span>Check Eligibility</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      {aiMatchScore !== null && (
                        <div className="space-y-3 mt-1.5">
                          {/* Score Banner */}
                          <div className={`p-3 rounded-xl border flex items-center justify-between font-sans ${
                            aiMatchScore >= 60
                              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-805'
                              : 'bg-rose-50/80 border-rose-200 text-rose-805'
                          }`}>
                            <div className="text-left">
                              <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-slate-400 block">AI Match Score</span>
                              <span className="text-[11px] font-sans font-semibold">
                                {aiMatchScore >= 60 ? 'Placement Criteria Met ✓' : 'Threshold Score Deficit ✗'}
                              </span>
                            </div>
                            <div className="text-right flex items-baseline gap-0.5">
                              <span className="text-xl font-bold font-mono leading-none">{aiMatchScore}</span>
                              <span className="text-[10px] font-bold font-mono text-slate-400">%</span>
                            </div>
                          </div>

                          {/* Strong Points */}
                          {aiStrongPoints && (
                            <div className="p-3 bg-emerald-50/30 border border-emerald-100/70 rounded-xl text-left space-y-1">
                              <h5 className="text-[9px] font-mono uppercase tracking-wider font-bold text-emerald-800 flex items-center gap-1">
                                <i className="fa-solid fa-circle-check text-[10px]" />
                                <span>Strong Assets</span>
                              </h5>
                              <div className="text-[11px] text-emerald-950 leading-relaxed pl-0.5">
                                {renderMarkdown(aiStrongPoints)}
                              </div>
                            </div>
                          )}

                          {/* Gaps */}
                          {aiGaps && (
                            <div className={`p-3 rounded-xl border text-left space-y-1 ${
                              aiMatchScore >= 60 ? 'bg-amber-50/30 border-amber-100' : 'bg-rose-50/30 border-rose-100'
                            }`}>
                              <h5 className={`text-[9px] font-mono uppercase tracking-wider font-bold flex items-center gap-1 ${
                                aiMatchScore >= 60 ? 'text-amber-850' : 'text-rose-850'
                              }`}>
                                <i className="fa-solid fa-triangle-exclamation text-[10px]" />
                                <span>Identified Gaps & Critique</span>
                              </h5>
                              <div className={`text-[11px] leading-relaxed pl-0.5 ${
                                aiMatchScore >= 60 ? 'text-amber-950' : 'text-rose-950'
                              }`}>
                                {renderMarkdown(aiGaps)}
                              </div>
                            </div>
                          )}

                          {/* Bio Recommendation */}
                          {aiBioRecommendation && (
                            <div className="p-3 bg-purple-50/30 border border-purple-100 rounded-xl text-left space-y-2 relative group">
                              <div className="flex items-center justify-between select-none">
                                <h5 className="text-[9px] font-mono uppercase tracking-wider font-bold text-purple-800 flex items-center gap-1">
                                  <i className="fa-solid fa-wand-magic-sparkles text-[10px]" />
                                  <span>Suggested Bio Tailoring</span>
                                </h5>
                                <button
                                  onClick={() => handleCopyBio(aiBioRecommendation)}
                                  className="px-2 py-0.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-[9px] font-mono font-bold transition-all hover:scale-105 cursor-pointer flex items-center gap-1"
                                  title="Copy bio to clipboard"
                                >
                                  <i className="fa-solid fa-copy text-[8px]" />
                                  <span>Copy</span>
                                </button>
                              </div>
                              <div className="text-[11px] text-purple-950 leading-relaxed font-sans italic pl-1 border-l-2 border-purple-200 py-0.5 select-text">
                                {aiBioRecommendation.replace(/^["']|["']$/g, '')}
                              </div>
                            </div>
                          )}

                          {/* Fallback to raw result if sections are not set */}
                          {!aiStrongPoints && !aiGaps && aiAuditResult && (
                            <div className="text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto pr-1 select-text font-sans mt-2">
                              {renderMarkdown(aiAuditResult)}
                            </div>
                          )}
                        </div>
                      )}

                      {isAuditing && (
                        <div className="flex items-center gap-2.5 py-3 text-slate-550 font-mono text-[10px] uppercase tracking-wider">
                          <i className="fa-solid fa-spinner fa-spin text-purple-650 text-sm" />
                          <span>Analyzing profile credentials...</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 font-semibold">Elevator Cover Letter Pitch (Optional)</label>
                  <textarea
                    rows={4}
                    value={coverLetterText}
                    onChange={(e) => setCoverLetterText(e.target.value)}
                    placeholder="Briefly pitch why your skills, projects and goals fit required credentials..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-sans resize-none"
                    disabled={!hasCheckedEligibility || (aiMatchScore !== null && aiMatchScore < 60)}
                  />
                  <p className="text-[10px] text-slate-450">A professional cover pitch makes recruiters review your dossier 60% faster.</p>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100 select-none">
                  <button
                    onClick={() => setApplyStep(1)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    disabled={isAuditing || !hasCheckedEligibility || aiMatchScore === null || aiMatchScore < 60}
                    onClick={() => setApplyStep(3)}
                    className={`px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isAuditing || !hasCheckedEligibility || aiMatchScore === null || aiMatchScore < 60
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-slate-900 hover:bg-brand-600 text-white cursor-pointer shadow-sm'
                    }`}
                  >
                    <span>Final Review</span>
                    <i className="fa-solid fa-arrow-right text-[10px]" />
                  </button>
                </div>
              </div>
            )}

            {applyStep === 3 && (
              <div className="space-y-4 text-left">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <p className="text-xs text-slate-900">
                    You are sending your verified student profile dossier to <strong>{selectedListing.company}</strong> for the role of <strong>{selectedListing.title}</strong>.
                  </p>
                  <div className="text-[11px] text-slate-500 font-mono space-y-1 border-t border-slate-200 pt-2">
                    <p>• Attached resume: {selectedResumeName}</p>
                    <p>• Contact email: {currentUser?.email}</p>
                    <p>• Pitch length: {coverLetterText ? `${coverLetterText.length} characters` : 'None'}</p>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100 select-none">
                  <button
                    onClick={() => setApplyStep(2)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleApplySubmit}
                    className="px-5 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Confirm & Dispatch Application</span>
                    <i className="fa-solid fa-paper-plane text-[10px]" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>,
        document.body
      )}

      {/* RECRUITER POST OPPORTUNITY MODAL */}
      {isPostModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 relative animate-fadeInUp max-h-[90vh] overflow-y-auto">
            
            <button
              id="cancel-post-modal"
              onClick={() => setIsPostModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>

            <form onSubmit={handlePostSubmit} className="space-y-4">
              <div className="border-b border-slate-200 pb-4 mb-4 text-left select-none">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <i className="fa-solid fa-award text-slate-900" /> <span className="ml-1">Post Opportunity Listings</span>
                </span>
                <h3 className="font-display font-medium text-lg text-slate-900 mt-1">
                  Publish New Placement Listing
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Your listing will be sent for faculty verification before student visibility.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 font-semibold">Listing Title *</label>
                  <input
                    id="post-title-input"
                    type="text"
                    required
                    placeholder="e.g. Senior Backend Associate"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-650 focus:ring-1 focus:ring-brand-600 px-3.5 py-2 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 font-semibold">Publishing Entity (Company)</label>
                  <input
                    id="post-company-input"
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-lg text-xs text-slate-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 font-semibold">Class Base (Category)</label>
                  <select
                    id="post-category-select"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg text-xs cursor-pointer"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 font-semibold">Geographic Strategy *</label>
                  <input
                    id="post-location-input"
                    type="text"
                    required
                    placeholder="e.g. SF, Tokyo, Remote"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-650 focus:ring-1 focus:ring-brand-600 px-3.5 py-2 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 font-semibold">Salary / Stipend Rate *</label>
                  <input
                    id="post-stipend-input"
                    type="text"
                    required
                    placeholder="e.g. $45 / hr or $5,000 / mo"
                    value={newStipend}
                    onChange={(e) => setNewStipend(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-650 focus:ring-1 focus:ring-brand-600 px-3.5 py-2 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 font-semibold">Portal Closing Date *</label>
                  <input
                    id="post-deadline-input"
                    type="text"
                    required
                    placeholder="e.g. June 30, 2026"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-650 focus:ring-1 focus:ring-brand-600 px-3.5 py-2 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 font-semibold">Primary Job Description *</label>
                <textarea
                  id="post-description-input"
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Summarize the core day to day projects, mentorship opportunities and stack values..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-sans resize-none"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 font-semibold">Prerequisites (One line each)</label>
                <textarea
                  id="post-requirements-input"
                  rows={2}
                  value={newRequirements}
                  onChange={(e) => setNewRequirements(e.target.value)}
                  placeholder="Enrolled in a Technical major&#10;Prior experience with databases&#10;Excellent communication structure"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-sans resize-none"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 font-semibold">Keywords & Tags (Comma Separated)</label>
                <input
                  id="post-skills-input"
                  type="text"
                  placeholder="React, CSS, SQL, Figma"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-650 focus:ring-1 focus:ring-brand-600 px-3.5 py-2 rounded-lg text-xs"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-4 border-t border-slate-200 mt-4 select-none">
                <button
                  type="button"
                  id="post-modal-autofill-btn"
                  onClick={handleAutofill}
                  className="w-full sm:w-auto px-3.5 py-2 bg-brand-50 hover:bg-brand-100 text-brand-600 border border-brand-100 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <i className="fa-solid fa-wand-magic-sparkles animate-pulse" />
                  Autofill Mock Data
                </button>
                <div className="flex gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    id="post-modal-cancel-btn"
                    onClick={() => setIsPostModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="post-modal-submit-btn"
                    className="px-5 py-2 bg-slate-900 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold cursor-pointer shadow flex items-center justify-center gap-1.5"
                  >
                    Launch Listing <i className="fa-solid fa-check text-xs" />
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
