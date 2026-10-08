import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { UserRole, UserProfile, Application, Internship } from '../types';

interface TrackerViewProps {
  currentRole: UserRole;
  currentUser: UserProfile;
  applications: Application[];
  internships: Internship[];
  allUsers: UserProfile[];
  onUpdateStatus: (appId: string, newStatus: Application['status'], offerDetails?: string) => void;
  onFacultyVerifyApplication: (appId: string, status: 'Verified' | 'Unverified', reason?: string) => void;
  onFacultyVerifyRecruiter: (recruiterId: string, status: 'Genuine' | 'Not Genuine', reason?: string) => void;
  onFacultyVerifyStudentProfile: (studentId: string, status: 'Pending' | 'Verified' | 'Unverified', remark?: string) => void;
  onFacultyReviewListing: (listingId: string, status: 'Verified' | 'Unverified', remark?: string) => void;
  triggerToast: (title: string, text: string, type: 'success' | 'info' | 'error') => void;
}

export default function TrackerView({
  currentRole,
  currentUser,
  applications,
  internships,
  allUsers,
  onUpdateStatus,
  onFacultyVerifyApplication,
  onFacultyVerifyRecruiter,
  onFacultyVerifyStudentProfile,
  onFacultyReviewListing,
  triggerToast
}: TrackerViewProps) {
  
  const [viewMode, setViewMode] = useState<'kanban' | 'audit'>('kanban');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [activeAuditTab, setActiveAuditTab] = useState<'students' | 'listings' | 'recruiters'>('students');

  // Draft reason states
  const [recruiterReasonDraft, setRecruiterReasonDraft] = useState('');
  const [studentReasonDraft, setStudentReasonDraft] = useState('');
  const [studentRemarkDraft, setStudentRemarkDraft] = useState('');
  const [listingRemarkDraft, setListingRemarkDraft] = useState('');
  const [appReasonDraft, setAppReasonDraft] = useState('');
  const [offerTextDraft, setOfferTextDraft] = useState('');

  // Kanban Columns
  const kanbanColumns: Application['status'][] = ['Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected'];

  // Filter applications depending on current user context
  const getVisibleApplications = () => {
    if (currentRole === 'Student') {
      return applications.filter((a) => a.studentId === currentUser.id);
    }
    if (currentRole === 'Company') {
      const companyLabel = (currentUser.companyName || '').toLowerCase();
      return applications.filter((a) => (a.companyName || '').toLowerCase() === companyLabel);
    }
    // Faculty / Admin see all
    return applications;
  };

  const visibleApplications = getVisibleApplications();

  const handleUpdateStatusSubmit = (appId: string, status: Application['status']) => {
    if (status === 'Offer' && !offerTextDraft.trim()) {
      triggerToast('Offer Details Required', 'Please draft the package details and compensation guidelines.', 'error');
      return;
    }
    onUpdateStatus(appId, status, status === 'Offer' ? offerTextDraft : undefined);
    setOfferTextDraft('');
    setSelectedApp(null);
  };

  const pendingCompanyVerificationListings = internships.filter((listing) => {
    const listingApplicationsCount = applications.filter((a) => a.internshipId === listing.id).length;
    return (listing.facultyApprovalStatus || 'Pending') === 'Pending' && listingApplicationsCount > 0;
  });

  return (
    <div className="space-y-6 fade-in-up">
      
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 text-left">
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] uppercase tracking-widest mb-1.5">
            <i className="fa-solid fa-chart-line text-brand-600 text-xs animate-pulse" />
            <span className="ml-1">Applicant Status Tracking</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-slate-900 tracking-tight font-semibold font-display">
            {currentRole === 'Company' ? `${currentUser.companyName} Placement Pipeline` : 'Career Pipeline Tracker'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Monitor applicant progress, submit verification reports, and issue placement offerings.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto shrink-0 select-none">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
              viewMode === 'kanban'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-grip-vertical text-xs" />
            <span>Pipeline Board</span>
          </button>
          {currentRole !== 'Student' && (
            <button
              onClick={() => setViewMode('audit')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                viewMode === 'audit'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-clipboard-check text-xs" />
              <span>Oversight Panel</span>
            </button>
          )}
        </div>
      </div>

      {/* KANBAN VIEW PANEL */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const colApps = visibleApplications.filter((a) => a.status === col);
            return (
              <div key={col} className="bg-slate-105 border border-slate-200 rounded-2xl p-3.5 space-y-4 min-w-[220px] flex flex-col justify-start">
                
                {/* Column Title */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 select-none">
                  <span className="text-[11px] font-mono tracking-wider text-slate-500 font-bold uppercase">
                    {col}
                  </span>
                  <span className="text-[10px] bg-white border border-slate-200 text-slate-900 font-bold px-2 py-0.5 rounded-md">
                    {colApps.length}
                  </span>
                </div>

                {/* Candidate Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
                  {colApps.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => {
                        setSelectedApp(app);
                        setOfferTextDraft(app.offerDetails || '');
                      }}
                      className="w-full bg-white border border-slate-200 hover:border-brand-600/40 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer text-left space-y-3.5 group relative"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-brand-600 truncate">
                          {app.studentName}
                        </p>
                        <p className="text-[9px] font-mono text-slate-400 truncate">
                          {app.studentCollege}
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                          Applied Placement
                        </span>
                        <p className="text-xs font-semibold text-slate-900 leading-normal truncate">
                          {app.internshipTitle}
                        </p>
                        <p className="text-[10px] text-slate-500">{app.companyName}</p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2.5 border-t border-dashed border-slate-100">
                        <span className="flex items-center gap-1">
                          <i className="fa-solid fa-calendar text-[9px]" />
                          {app.dateApplied}
                        </span>
                        
                        {app.facultyVerificationStatus === 'Verified' ? (
                          <span className="text-emerald-700 font-bold text-[9px]">Vetted ✓</span>
                        ) : app.facultyVerificationStatus === 'Unverified' ? (
                          <span className="text-rose-600 font-bold text-[9px]">Flagged ✗</span>
                        ) : (
                          <span className="text-slate-400 text-[9px]">Reviewing</span>
                        )}
                      </div>
                    </button>
                  ))}
                  {colApps.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic text-center py-8">Empty Stage</p>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* OVERSIGHT PANEL TABBED VIEW */}
      {viewMode === 'audit' && (
        <div className="space-y-6">
          <div className="flex border-b border-slate-200 pb-3 gap-4 select-none">
            <button
              onClick={() => setActiveAuditTab('students')}
              className={`text-xs font-bold pb-2 transition-all cursor-pointer border-b-2 ${
                activeAuditTab === 'students' ? 'border-brand-600 text-brand-650' : 'border-transparent text-slate-400 hover:text-slate-805'
              }`}
            >
              Student Verifications
            </button>
            <button
              onClick={() => setActiveAuditTab('listings')}
              className={`text-xs font-bold pb-2 transition-all cursor-pointer border-b-2 ${
                activeAuditTab === 'listings' ? 'border-brand-600 text-brand-650' : 'border-transparent text-slate-400 hover:text-slate-805'
              }`}
            >
              Placement Reviews ({pendingCompanyVerificationListings.length})
            </button>
            {currentRole === 'Faculty' && (
              <button
                onClick={() => setActiveAuditTab('recruiters')}
                className={`text-xs font-bold pb-2 transition-all cursor-pointer border-b-2 ${
                  activeAuditTab === 'recruiters' ? 'border-brand-600 text-brand-650' : 'border-transparent text-slate-400 hover:text-slate-805'
                }`}
              >
                Recruiter Vetting
              </button>
            )}
          </div>

          {/* tab student verification */}
          {activeAuditTab === 'students' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 font-display">Pending Student Verification</h3>
                <p className="text-[10px] text-slate-400 italic mb-2 select-none">Click any student card to audit their full profile details.</p>
                <div className="space-y-3 overflow-y-auto max-h-96">
                  {allUsers.filter((u) => u.role === 'Student' && (u.studentProfileVerificationStatus || 'Pending') === 'Pending').map((student) => (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className="p-3 border border-slate-200 hover:border-brand-600 rounded-xl bg-slate-50 flex justify-between items-center cursor-pointer transition-all hover:shadow-xs group"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-brand-650 truncate">{student.name}</p>
                        <p className="text-[10px] text-slate-450 truncate">{student.email}</p>
                        <p className="text-[10px] text-slate-500">{student.college} • major: {student.graduationYear || '2026'}</p>
                      </div>
                      <div className="flex gap-2 shrink-0 select-none">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onFacultyVerifyStudentProfile(student.id, 'Verified');
                            triggerToast('Student Verified', `Successfully verified ${student.name}'s profile.`, 'success');
                          }}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700 cursor-pointer"
                        >
                          Verify
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!studentReasonDraft.trim()) {
                              triggerToast('Reason Required', 'Provide feedback remark reason in the box below.', 'error');
                              return;
                            }
                            onFacultyVerifyStudentProfile(student.id, 'Unverified', studentReasonDraft);
                            triggerToast('Student Flagged', `Marked ${student.name}'s profile as unverified.`, 'info');
                            setStudentReasonDraft('');
                          }}
                          className="px-2.5 py-1 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                  {allUsers.filter((u) => u.role === 'Student' && (u.studentProfileVerificationStatus || 'Pending') === 'Pending').length === 0 && (
                    <p className="text-xs text-slate-450 italic text-center py-4">No student profiles pending verification.</p>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={studentReasonDraft}
                  onChange={(e) => setStudentReasonDraft(e.target.value)}
                  placeholder="Feedback details/remark for quick rejection button..."
                  className="w-full text-xs font-sans p-2 rounded-lg bg-white border border-slate-200 resize-none mt-2"
                />
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 font-display">Student Verification Logs</h3>
                <p className="text-[10px] text-slate-400 italic mb-2 select-none">Click any student card to review logs or details.</p>
                <div className="space-y-2 overflow-y-auto max-h-96">
                  {allUsers.filter((u) => u.role === 'Student' && (u.studentProfileVerificationStatus || 'Pending') !== 'Pending').map((student) => (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className="p-3 border border-slate-200 hover:border-brand-600 rounded-xl bg-slate-50/50 flex justify-between items-center text-xs cursor-pointer transition-all hover:shadow-xs group"
                    >
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-brand-650">{student.name}</p>
                        <p className="text-[10px] text-slate-400">{student.email}</p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Verified: <span className={student.studentProfileVerificationStatus === 'Verified' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>{student.studentProfileVerificationStatus}</span>
                        </p>
                        {student.studentProfileVerificationRemark && (
                          <p className="text-[10px] text-rose-700 italic">Remark: {student.studentProfileVerificationRemark}</p>
                        )}
                      </div>
                      {currentRole === 'Faculty' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (student.studentProfileVerificationStatus === 'Verified') {
                              const remark = window.prompt(`Enter rejection remark for ${student.name}:`) || 'Vetting audit flagged.';
                              onFacultyVerifyStudentProfile(student.id, 'Unverified', remark);
                              triggerToast('Student Profile Flagged', `Marked ${student.name}'s profile as unverified.`, 'info');
                            } else {
                              onFacultyVerifyStudentProfile(student.id, 'Verified');
                              triggerToast('Student Verified', `Successfully verified ${student.name}'s profile.`, 'success');
                            }
                          }}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer select-none ${
                            student.studentProfileVerificationStatus === 'Verified'
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                          }`}
                        >
                          {student.studentProfileVerificationStatus === 'Verified' ? 'Reject' : 'Verify'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* tab listing approval */}
          {activeAuditTab === 'listings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 font-display">Pending Placements Audit</h3>
                <div className="space-y-3 overflow-y-auto max-h-96">
                  {internships.filter((i) => (i.facultyApprovalStatus || 'Pending') === 'Pending').map((listing) => (
                    <div key={listing.id} className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex justify-between items-center">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{listing.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{listing.company} • {listing.location}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Salary: {listing.stipend}</p>
                      </div>
                      <div className="flex gap-2 shrink-0 select-none">
                        <button
                          onClick={() => onFacultyReviewListing(listing.id, 'Verified')}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700 cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            if (!listingRemarkDraft.trim()) {
                              triggerToast('Remark Required', 'Provide rejection details.', 'error');
                              return;
                            }
                            onFacultyReviewListing(listing.id, 'Unverified', listingRemarkDraft);
                            setListingRemarkDraft('');
                          }}
                          className="px-2.5 py-1 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                  {internships.filter((i) => (i.facultyApprovalStatus || 'Pending') === 'Pending').length === 0 && (
                    <p className="text-xs text-slate-450 italic text-center py-4">No placement listings pending coordinates audit.</p>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={listingRemarkDraft}
                  onChange={(e) => setListingRemarkDraft(e.target.value)}
                  placeholder="Feedback details when rejecting a placement listing..."
                  className="w-full text-xs font-sans p-2 rounded-lg bg-white border border-slate-200 resize-none mt-2"
                />
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 font-display">Placement Listings Logs</h3>
                <div className="space-y-2 overflow-y-auto max-h-96">
                  {internships.filter((i) => (i.facultyApprovalStatus || 'Pending') !== 'Pending').map((listing) => (
                    <div key={listing.id} className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{listing.title}</p>
                        <p className="text-[10px] text-slate-500">{listing.company}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Vetting: <span className={listing.facultyApprovalStatus === 'Verified' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>{listing.facultyApprovalStatus}</span>
                        </p>
                        {listing.facultyApprovalRemark && (
                          <p className="text-[10px] text-rose-700 italic">Remark: {listing.facultyApprovalRemark}</p>
                        )}
                      </div>
                      {currentRole === 'Faculty' && (
                        <button
                          onClick={() => onFacultyReviewListing(listing.id, 'Verified')}
                          className="px-2 py-0.5 bg-slate-200 text-slate-800 hover:bg-brand-600 hover:text-white rounded text-[10px] transition-colors cursor-pointer select-none"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* tab recruiter vetting */}
          {activeAuditTab === 'recruiters' && currentRole === 'Faculty' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 font-display">Company Recruiter Verification</h3>
                <div className="space-y-3 overflow-y-auto max-h-96">
                  {allUsers.filter((u) => u.role === 'Company' && (u.recruiterVerificationStatus || 'Pending') === 'Pending').map((recruiter) => (
                    <div key={recruiter.id} className="p-3 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900">{recruiter.name}</p>
                        <p className="text-[10px] text-slate-400">Company: <span className="font-semibold">{recruiter.companyName}</span></p>
                        <p className="text-[10px] text-slate-405">Email: {recruiter.email}</p>
                      </div>
                      <div className="flex gap-2 select-none">
                        <button
                          onClick={() => onFacultyVerifyRecruiter(recruiter.id, 'Genuine')}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700 cursor-pointer"
                        >
                          Approve Recruiter
                        </button>
                        <button
                          onClick={() => {
                            if (!recruiterReasonDraft.trim()) {
                              triggerToast('Reason Required', 'Provide rejection details.', 'error');
                              return;
                            }
                            onFacultyVerifyRecruiter(recruiter.id, 'Not Genuine', recruiterReasonDraft);
                            setRecruiterReasonDraft('');
                          }}
                          className="px-2.5 py-1 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                        >
                          Mark Unverified
                        </button>
                      </div>
                    </div>
                  ))}
                  {allUsers.filter((u) => u.role === 'Company' && (u.recruiterVerificationStatus || 'Pending') === 'Pending').length === 0 && (
                    <p className="text-xs text-slate-450 italic text-center py-4">No recruiters pending coordinates verification.</p>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={recruiterReasonDraft}
                  onChange={(e) => setRecruiterReasonDraft(e.target.value)}
                  placeholder="Feedback details when rejecting recruiter..."
                  className="w-full text-xs font-sans p-2 rounded-lg bg-white border border-slate-200 resize-none mt-2"
                />
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 font-display">Recruiter Vetting Records</h3>
                <div className="space-y-2 overflow-y-auto max-h-96">
                  {allUsers.filter((u) => u.role === 'Company' && (u.recruiterVerificationStatus || 'Pending') !== 'Pending').map((recruiter) => (
                    <div key={recruiter.id} className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{recruiter.name} ({recruiter.companyName})</p>
                        <p className="text-[10px] text-slate-400">{recruiter.email}</p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Vetting: <span className={recruiter.recruiterVerificationStatus === 'Genuine' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>{recruiter.recruiterVerificationStatus}</span>
                        </p>
                        {recruiter.recruiterVerificationReason && (
                          <p className="text-[10px] text-rose-700 italic">Remark: {recruiter.recruiterVerificationReason}</p>
                        )}
                      </div>
                      <button
                        onClick={() => onFacultyVerifyRecruiter(recruiter.id, 'Genuine')}
                        className="px-2 py-0.5 bg-slate-200 text-slate-800 hover:bg-brand-600 hover:text-white rounded text-[10px] transition-colors cursor-pointer select-none"
                      >
                        Reset Vetting
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CANDIDATE DETAIL DRAWER MODAL */}
      {selectedApp && createPortal(
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-text">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 relative overflow-y-auto max-h-[90vh]">
            
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer select-none"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>

            <div className="border-b border-slate-200 pb-4 mb-4 text-left">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold select-none">
                Candidate Application Dossier
              </span>
              <h3 className="font-serif font-semibold text-lg text-slate-900 font-display">
                {selectedApp.internshipTitle}
              </h3>
              <p className="text-xs text-slate-500">{selectedApp.companyName} Division</p>
            </div>

            {/* Student metadata */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3.5 mb-4 text-left">
              <div className="h-10 w-10 rounded-full bg-brand-600 text-white font-semibold flex items-center justify-center font-serif text-sm shrink-0 select-none">
                {selectedApp.studentName.charAt(0)}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{selectedApp.studentName}</h4>
                <p className="text-[10px] text-slate-450 font-mono truncate">{selectedApp.studentEmail}</p>
                <p className="text-[10px] text-slate-550 truncate">{selectedApp.studentCollege}</p>
              </div>
              <div className="ml-auto text-right select-none">
                <span className="inline-block text-[9px] font-mono bg-indigo-50 border border-indigo-200 rounded px-2 py-0.5 font-semibold text-indigo-850">
                  {selectedApp.status}
                </span>
                <p className="text-[9px] text-slate-400 font-mono mt-1">Logged {selectedApp.dateApplied}</p>
              </div>
            </div>

            {/* Application checklist detail */}
            <div className="space-y-4">
              
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-left text-xs">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-450 font-bold select-none">Faculty Verification</p>
                <p className="text-slate-900 mt-1 select-text">
                  {selectedApp.facultyVerificationStatus === 'Verified' ? (
                    <span className="text-emerald-700 font-bold"><i className="fa-solid fa-circle-check mr-1" /> Profile approved for matching</span>
                  ) : selectedApp.facultyVerificationStatus === 'Unverified' ? (
                    <span className="text-rose-600 font-bold"><i className="fa-solid fa-circle-xmark mr-1" /> Profile flagged: {selectedApp.facultyUnverifiedReason}</span>
                  ) : (
                    <span className="text-slate-500 italic"><i className="fa-solid fa-spinner fa-spin mr-1" /> Awaiting coordinator compliance check</span>
                  )}
                </p>
              </div>

              {selectedApp.coverLetter && (
                <div className="space-y-1.5 text-left">
                  <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-450 font-bold select-none">Cover Letter Pitch</h5>
                  <p className="text-xs leading-relaxed text-slate-600 bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-sans whitespace-pre-line select-text">
                    {selectedApp.coverLetter}
                  </p>
                </div>
              )}

              {/* Resume download */}
              <div className="space-y-1.5 text-left">
                <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-450 font-bold select-none">Resume PDF File</h5>
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <i className="fa-solid fa-file-pdf text-rose-600 text-base shrink-0" />
                    <span className="text-xs text-slate-900 truncate font-semibold font-mono">{selectedApp.resumeName || 'resume.pdf'}</span>
                  </div>
                  {selectedApp.resumeUrl ? (
                    <a
                      href={selectedApp.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-brand-600 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all select-none"
                    >
                      <span>Download</span>
                      <i className="fa-solid fa-arrow-down-long text-[9px] ml-0.5" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic select-none">Local sync only</span>
                  )}
                </div>
              </div>

              {/* Recruiter Action Controls (Only Recruiter owner / Admin can shift candidates) */}
              {(currentRole === 'Admin' || (currentRole === 'Company' && currentUser?.companyName?.toLowerCase() === selectedApp.companyName?.toLowerCase())) && (
                <div className="space-y-3 pt-4 border-t border-slate-200 text-left">
                  <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-450 font-bold select-none">
                    Recruiter Status Controls
                  </h5>
                  
                  {/* Status Selection Buttons */}
                  <div className="grid grid-cols-3 gap-2 select-none">
                    {['Shortlisted', 'Interview', 'Rejected'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatusSubmit(selectedApp.id, status as any)}
                        className={`py-2 px-1 rounded-xl border text-[11px] font-bold text-center cursor-pointer transition-all ${
                          selectedApp.status === status 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-brand-600 hover:text-slate-800'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  {/* Offer workflow */}
                  <div className="space-y-2 pt-2 border-t border-dashed border-slate-200">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-450 font-semibold select-none">
                      Issue Formal Placement Offer Details
                    </label>
                    <textarea
                      rows={2}
                      value={offerTextDraft}
                      onChange={(e) => setOfferTextDraft(e.target.value)}
                      placeholder="e.g. Congratulations! We offer you a monthly stipend of $6,000 / mo starting July 1, 2026."
                      className="w-full text-xs font-sans p-2 rounded-lg bg-white border border-slate-200 resize-none"
                    />
                    <div className="flex justify-between items-center select-none">
                      <button
                        onClick={() => {
                          setOfferTextDraft(`Congratulations, ${selectedApp.studentName}! We are thrilled to offer you the placement at ${selectedApp.companyName}.`);
                        }}
                        className="text-[10px] text-brand-600 hover:underline cursor-pointer font-bold"
                      >
                        Autofill Offer Template
                      </button>
                      <button
                        onClick={() => handleUpdateStatusSubmit(selectedApp.id, 'Offer')}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        Send Offer Letter
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Faculty Coordinator Controls */}
              {currentRole === 'Faculty' && (
                <div className="space-y-3 pt-4 border-t border-slate-200 text-left">
                  <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-450 font-bold select-none">
                    Faculty Coordinator Audit
                  </h5>
                  
                  <div className="grid grid-cols-2 gap-3 select-none">
                    <button
                      onClick={() => {
                        onFacultyVerifyApplication(selectedApp.id, 'Verified');
                        setSelectedApp(null);
                      }}
                      className="py-2 px-1 rounded-xl bg-emerald-650 hover:bg-emerald-700 text-white text-[11px] font-bold text-center cursor-pointer transition-all flex items-center justify-center gap-1"
                    >
                      <i className="fa-solid fa-circle-check text-xs" /> Approve Application
                    </button>
                    <button
                      onClick={() => {
                        if (!appReasonDraft.trim()) {
                          triggerToast('Remark Required', 'Explain why application status is flagged unverified.', 'error');
                          return;
                        }
                        onFacultyVerifyApplication(selectedApp.id, 'Unverified', appReasonDraft);
                        setAppReasonDraft('');
                        setSelectedApp(null);
                      }}
                      className="py-2 px-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold text-center cursor-pointer transition-all flex items-center justify-center gap-1"
                    >
                      <i className="fa-solid fa-circle-xmark text-xs" /> Flag Application
                    </button>
                  </div>
                  
                  <textarea
                    rows={2}
                    value={appReasonDraft}
                    onChange={(e) => setAppReasonDraft(e.target.value)}
                    placeholder="Enter reason feedback when flagging candidate application..."
                    className="w-full text-xs font-sans p-2 rounded-lg bg-white border border-slate-200 resize-none mt-2"
                  />
                </div>
              )}

              {/* Offer Details presentation (For students or when status === 'Offer') */}
              {selectedApp.status === 'Offer' && selectedApp.offerDetails && (
                <div className="space-y-1.5 text-left border-t border-slate-200 pt-4">
                  <h5 className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold flex items-center gap-1 select-none">
                    <i className="fa-solid fa-gift text-xs" /> Formal Placement Offer Issued
                  </h5>
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 font-sans leading-relaxed select-text whitespace-pre-line">
                    {selectedApp.offerDetails}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>,
        document.body
      )}

      {selectedStudent && createPortal(
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-text animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 relative overflow-y-auto max-h-[90vh]">
            
            <button
              onClick={() => {
                setSelectedStudent(null);
                setStudentRemarkDraft('');
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-55 transition-colors cursor-pointer select-none"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>

            <div className="border-b border-slate-200 pb-4 mb-4 text-left">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold select-none">
                Student Profile Dossier
              </span>
              <h3 className="font-serif font-semibold text-xl text-slate-900 font-display">
                {selectedStudent.name}
              </h3>
              <p className="text-xs text-slate-500">{selectedStudent.email}</p>
            </div>

            <div className="space-y-5">
              
              {/* College & Graduation */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-xl text-left">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase font-semibold">University/College</span>
                  <p className="text-xs font-semibold text-slate-905">{selectedStudent.college || 'Not Specified'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase font-semibold">Graduation Year</span>
                  <p className="text-xs font-semibold text-slate-905">{selectedStudent.graduationYear || 'Not Specified'}</p>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5 text-left font-sans">
                <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-450 font-bold select-none">Biography</h5>
                <p className="text-xs leading-relaxed text-slate-650 bg-slate-50/50 border border-slate-200 p-3.5 rounded-xl whitespace-pre-line select-text">
                  {selectedStudent.bio || 'No biography written yet.'}
                </p>
              </div>

              {/* Skills */}
              <div className="space-y-1.5 text-left">
                <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-455 font-bold select-none">Skills & Competencies</h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudent.skills && selectedStudent.skills.length > 0 ? (
                    selectedStudent.skills.map((skill) => (
                      <span key={skill} className="text-xs bg-brand-50 text-brand-650 px-2.5 py-1 rounded-md font-mono border border-brand-100">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No skills listed.</span>
                  )}
                </div>
              </div>

              {/* Grades */}
              <div className="space-y-1.5 text-left">
                <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-450 font-bold select-none">Academic Transcript (Grades)</h5>
                {selectedStudent.grades && selectedStudent.grades.filter(g => g.gpa.trim() !== '').length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs font-sans">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-250 font-mono text-[10px] text-slate-505 uppercase">
                          <th className="px-4 py-2 text-left">Semester</th>
                          <th className="px-4 py-2 text-right">GPA (out of 10)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStudent.grades.filter(g => g.gpa.trim() !== '').map((grade, idx) => (
                          <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/30">
                            <td className="px-4 py-2 text-slate-705">{grade.semester}</td>
                            <td className="px-4 py-2 text-right font-mono font-bold text-slate-900">{grade.gpa}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-450 italic">No grades recorded.</p>
                )}
              </div>

              {/* Certifications */}
              <div className="space-y-1.5 text-left">
                <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-450 font-bold select-none">Professional Certifications</h5>
                {selectedStudent.certificates && selectedStudent.certificates.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedStudent.certificates.map((cert, idx) => (
                      <div key={idx} className="p-3 bg-slate-50/50 border border-slate-200 rounded-xl space-y-1 text-xs">
                        <p className="font-bold text-slate-900 leading-tight">{cert.name}</p>
                        <p className="text-[10px] text-slate-500">{cert.issuer} • {cert.date}</p>
                        {cert.credentialUrl && (
                          <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-[9px] font-bold text-brand-600 hover:underline inline-flex items-center gap-0.5 mt-1">
                            View Credential <i className="fa-solid fa-up-right-from-square text-[8px]" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-450 italic">No certifications listed.</p>
                )}
              </div>

              {/* Resume PDF File */}
              <div className="space-y-1.5 text-left">
                <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-450 font-bold select-none">Resume PDF File</h5>
                {selectedStudent.resumeName ? (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <i className="fa-solid fa-file-pdf text-rose-600 text-base shrink-0" />
                      <span className="text-xs text-slate-900 truncate font-semibold font-mono">{selectedStudent.resumeName}</span>
                    </div>
                    {selectedStudent.resumeUrl ? (
                      <a
                        href={selectedStudent.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-slate-900 hover:bg-brand-600 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all select-none"
                      >
                        <span>Download</span>
                        <i className="fa-solid fa-arrow-down-long text-[9px] ml-0.5" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic select-none">Local sync only</span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-450 italic">No resume uploaded.</p>
                )}
              </div>

              {/* Social and Portfolios */}
              <div className="space-y-2 text-left pt-2 border-t border-slate-100">
                <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-450 font-bold select-none">Social and Portfolios</h5>
                <div className="flex flex-wrap gap-3 text-xs text-slate-650">
                  {selectedStudent.portfolioUrl && (
                    <a href={selectedStudent.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-brand-600">
                      <i className="fa-solid fa-globe" /> Portfolio
                    </a>
                  )}
                  {selectedStudent.githubUrl && (
                    <a href={selectedStudent.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-brand-600">
                      <i className="fa-brands fa-github" /> GitHub
                    </a>
                  )}
                  {selectedStudent.linkedinUrl && (
                    <a href={selectedStudent.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-brand-600">
                      <i className="fa-brands fa-linkedin text-blue-700" /> LinkedIn
                    </a>
                  )}
                  {selectedStudent.xUrl && (
                    <a href={selectedStudent.xUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-brand-600">
                      <i className="fa-brands fa-x-twitter" /> Twitter/X
                    </a>
                  )}
                  {!selectedStudent.portfolioUrl && !selectedStudent.githubUrl && !selectedStudent.linkedinUrl && !selectedStudent.xUrl && (
                    <span className="text-xs text-slate-400 italic">No social links configured.</span>
                  )}
                </div>
              </div>

              {/* Faculty Coordinator Controls */}
              {currentRole === 'Faculty' && (
                <div className="space-y-3 pt-4 border-t border-slate-200 text-left">
                  <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-450 font-bold select-none">
                    Faculty Coordinator Audit Actions
                  </h5>
                  
                  <textarea
                    rows={2}
                    value={studentRemarkDraft}
                    onChange={(e) => setStudentRemarkDraft(e.target.value)}
                    placeholder="Enter rejection feedback remark (required only if rejecting)..."
                    className="w-full text-xs font-sans p-2.5 rounded-lg bg-white border border-slate-200 resize-none"
                  />

                  <div className="grid grid-cols-2 gap-3 select-none pt-1">
                    <button
                      onClick={() => {
                        onFacultyVerifyStudentProfile(selectedStudent.id, 'Verified', studentRemarkDraft || undefined);
                        triggerToast('Student Verified', `Successfully verified ${selectedStudent.name}'s profile.`, 'success');
                        setSelectedStudent(null);
                        setStudentRemarkDraft('');
                      }}
                      className="py-2 px-1 rounded-xl bg-emerald-650 hover:bg-emerald-700 text-white text-[11px] font-bold text-center cursor-pointer transition-all flex items-center justify-center gap-1"
                    >
                      <i className="fa-solid fa-circle-check text-xs" /> Approve Profile
                    </button>
                    <button
                      onClick={() => {
                        if (!studentRemarkDraft.trim()) {
                          triggerToast('Remark Required', 'Explain why student profile is unverified.', 'error');
                          return;
                        }
                        onFacultyVerifyStudentProfile(selectedStudent.id, 'Unverified', studentRemarkDraft);
                        triggerToast('Student Profile Flagged', `Marked ${selectedStudent.name}'s profile as unverified.`, 'info');
                        setSelectedStudent(null);
                        setStudentRemarkDraft('');
                      }}
                      className="py-2 px-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold text-center cursor-pointer transition-all flex items-center justify-center gap-1"
                    >
                      <i className="fa-solid fa-circle-xmark text-xs" /> Reject with Remark
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
