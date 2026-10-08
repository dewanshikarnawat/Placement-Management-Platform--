import React, { useState } from 'react';
import { UserRole, UserProfile, Internship, Application } from '../types';

interface AdminViewProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  internships: Internship[];
  applications: Application[];
  onInviteUser: (user: UserProfile & { password?: string }) => void;
  onRemoveUser: (userId: string) => void;
  onUpdateUserRole: (userId: string, newRole: UserRole, companyName?: string) => void;
  triggerToast: (title: string, text: string, type: 'success' | 'info' | 'error') => void;
}

export default function AdminView({
  currentUser,
  allUsers,
  internships,
  applications,
  onInviteUser,
  onRemoveUser,
  onUpdateUserRole,
  triggerToast
}: AdminViewProps) {

  // Invite modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Student');
  const [inviteCompany, setInviteCompany] = useState('');

  // Editing User role mapping
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [roleDraft, setRoleDraft] = useState<UserRole>('Student');
  const [companyDraft, setCompanyDraft] = useState('');

  // Settle statistical reports
  const totalStudents = allUsers.filter(u => u.role === 'Student').length;
  const totalCompanyRecruiters = allUsers.filter(u => u.role === 'Company').length;
  const placementRate = applications.length > 0
    ? Math.round((applications.filter(a => a.status === 'Offer').length / applications.length) * 100)
    : 0;

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail || !invitePassword) {
      triggerToast('Validation error', 'Please fill name, email, and password credentials.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      triggerToast('Invalid Email', 'Please insert a valid formatting email.', 'error');
      return;
    }

    const newUser: UserProfile & { password?: string } = {
      id: `${inviteRole.toLowerCase()}-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      password: invitePassword,
      role: inviteRole,
      companyName: inviteRole === 'Company' ? inviteCompany || 'Linear' : undefined,
      college: inviteRole === 'Student' ? 'Sir Padampat Singhania University' : undefined,
      skills: inviteRole === 'Student' ? ['React', 'Git'] : undefined,
      bio: `Enrolled as ${inviteRole} on university records.`
    };

    onInviteUser(newUser);
    triggerToast(
      'Account Created',
      `Registered and provisioned credentials for ${inviteName} as ${inviteRole}.`,
      'success'
    );

    // Reset Form
    setIsInviteOpen(false);
    setInviteName('');
    setInviteEmail('');
    setInvitePassword('');
    setInviteRole('Student');
    setInviteCompany('');
  };

  const handleRoleSave = (userId: string) => {
    onUpdateUserRole(userId, roleDraft, roleDraft === 'Company' ? companyDraft : undefined);
    setEditingUserId(null);
    triggerToast('Access Authorized', 'User privileges updated successfully', 'success');
  };

  const handleReportGeneration = () => {
    triggerToast('Report Generated', 'Summer 2026 conversion audits exported cleanly to CSV.', 'success');
  };

  return (
    <div className="space-y-6 fade-in-up text-left">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] uppercase tracking-widest mb-1.5 animate-pulse">
            <i className="fa-solid fa-wand-magic-sparkles text-brand-600 text-xs" />
            <span className="ml-1">Academic Overseer Suite</span>
          </div>
          <h1 className="text-2xl font-serif font-semibold text-slate-900 tracking-tight font-display">
            Administrative Control Panel
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-sans">
            Monitor verified university enrollments, audit placement ratios, and regulate access privileges.
          </p>
        </div>

        <div className="flex gap-2 select-none">
          <button
            id="admin-export-report-btn"
            onClick={handleReportGeneration}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <i className="fa-solid fa-download text-slate-500" />
            <span>Generate Report</span>
          </button>
          
          <button
            id="admin-invite-trigger-btn"
            onClick={() => setIsInviteOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-brand-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all hover:scale-101"
          >
            <i className="fa-solid fa-user-plus" />
            <span>Invite User</span>
          </button>
        </div>
      </div>

      {/* Modern High-fidelity Bento Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="admin-analytics-grid">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left flex items-start gap-4 shadow-xs">
          <div className="p-3 bg-white border border-slate-200 rounded-xl text-brand-600 shadow-xs flex items-center justify-center">
            <i className="fa-solid fa-users text-sm" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Total Registered users</span>
            <p className="text-2xl font-serif font-bold text-slate-900 leading-none mt-1.5 font-display">{allUsers.length}</p>
            <p className="text-[10px] text-slate-550 mt-1 font-mono">Students + recruiters</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left flex items-start gap-4 shadow-xs">
          <div className="p-3 bg-white border border-slate-200 rounded-xl text-indigo-700 shadow-xs flex items-center justify-center">
            <i className="fa-solid fa-building text-sm" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Sponsor companies</span>
            <p className="text-2xl font-serif font-bold text-slate-900 leading-none mt-1.5 font-display">{totalCompanyRecruiters}</p>
            <p className="text-[10px] text-slate-550 mt-1 font-mono">Active recruiting tags</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left flex items-start gap-4 shadow-xs">
          <div className="p-3 bg-white border border-slate-200 rounded-xl text-emerald-700 shadow-xs flex items-center justify-center">
            <i className="fa-solid fa-chart-line text-sm" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Student placement rate</span>
            <p className="text-2xl font-serif font-bold text-slate-900 leading-none mt-1.5 font-display">{placementRate}%</p>
            <p className="text-[10px] text-slate-550 mt-1 font-mono">Average summer conversion</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left flex items-start gap-4 shadow-xs">
          <div className="p-3 bg-white border border-slate-200 rounded-xl text-amber-700 shadow-xs flex items-center justify-center">
            <i className="fa-solid fa-layer-group text-sm" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Placement Openings</span>
            <p className="text-2xl font-serif font-bold text-slate-900 leading-none mt-1.5 font-display">{internships.length}</p>
            <p className="text-[10px] text-slate-555 mt-1 font-mono">Live career openings</p>
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden" id="admin-table-container">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h4 className="font-serif font-semibold text-base text-slate-900 font-display">Regulated Users Directory</h4>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 py-0.5 px-2 rounded border border-slate-200 select-none">
            System Users: {allUsers.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold select-none">
                <th className="py-3 px-5">User Coordinates</th>
                <th className="py-3 px-5">Security Level</th>
                <th className="py-3 px-5">Affiliated Institution</th>
                <th className="py-3 px-5 text-right">Directory Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {allUsers.map((user) => {
                const isEditing = editingUserId === user.id;

                let roleBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-250';
                if (user.role === 'Admin') roleBadgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
                if (user.role === 'Company') roleBadgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-200';
                if (user.role === 'Faculty') roleBadgeColor = 'bg-teal-50 text-teal-800 border-teal-200';

                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors text-xs" id={`user-row-${user.id}`}>
                    {/* User identifier */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3 font-sans">
                        <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-900 font-serif flex items-center justify-center font-bold shrink-0 border border-slate-200 select-none">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-905">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono -mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role update field */}
                    <td className="py-4 px-5">
                      {isEditing ? (
                        <select
                          id={`user-role-select-${user.id}`}
                          value={roleDraft}
                          onChange={(e) => {
                            setRoleDraft(e.target.value as any);
                            if (e.target.value === 'Company' && !companyDraft) {
                              setCompanyDraft('Linear');
                            }
                          }}
                          className="bg-white border border-slate-200 focus:border-brand-650 p-1.5 rounded-lg text-xs font-bold text-slate-900 cursor-pointer"
                        >
                          <option value="Student">Student</option>
                          <option value="Company">Company / Recruiter</option>
                          <option value="Faculty">Faculty</option>
                          <option value="Admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded border select-none ${roleBadgeColor}`}>
                          {user.role}
                        </span>
                      )}
                    </td>

                    {/* Associated corporate key */}
                    <td className="py-4 px-5">
                      {isEditing && roleDraft === 'Company' ? (
                        <input
                          id={`user-company-input-${user.id}`}
                          type="text"
                          value={companyDraft}
                          onChange={(e) => setCompanyDraft(e.target.value)}
                          className="bg-white border border-slate-200 focus:border-brand-650 p-1.5 rounded-lg text-xs text-slate-900 max-w-[120px]"
                          placeholder="Company name"
                        />
                      ) : (
                        <span className="text-slate-600 font-semibold font-sans">
                          {user.role === 'Company' ? user.companyName : (user.college || 'Placera Academic')}
                        </span>
                      )}
                    </td>

                    {/* Controls delete or save */}
                    <td className="py-4 px-5 text-right select-none">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button
                              id={`save-user-role-${user.id}`}
                              onClick={() => handleRoleSave(user.id)}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700 cursor-pointer shadow-sm"
                            >
                              Save
                            </button>
                            <button
                              id={`cancel-user-role-${user.id}`}
                              onClick={() => setEditingUserId(null)}
                              className="p-1 bg-slate-100 rounded hover:bg-slate-200 cursor-pointer flex items-center justify-center"
                            >
                              <i className="fa-solid fa-xmark text-slate-500 text-xs" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              id={`edit-user-role-trigger-${user.id}`}
                              onClick={() => {
                                setEditingUserId(user.id);
                                setRoleDraft(user.role);
                                setCompanyDraft(user.companyName || '');
                              }}
                              className="text-brand-600 font-semibold hover:underline text-[11px] cursor-pointer"
                            >
                              Assign Access
                            </button>
                            
                            {user.id !== currentUser.id && (
                              <button
                                id={`delete-user-btn-${user.id}`}
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this user profile?')) {
                                    onRemoveUser(user.id);
                                    triggerToast('User Removed', `Revoked credentials for ${user.name} safely.`, 'info');
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer transition-colors flex items-center justify-center"
                                title="Remove User"
                              >
                                <i className="fa-solid fa-trash-can text-xs" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50/20 select-none">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 justify-center font-sans">
            <i className="fa-solid fa-triangle-exclamation text-brand-600 text-xs" />
            <p>Admin edits will update acting privileges instantly. Test role simulator in top-right whenever desired.</p>
          </div>
        </div>
      </div>

      {/* INVITE NEW USER (MODAL) */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-lg border border-slate-200 relative">
            
            <button
              id="cancel-invite-modal"
              onClick={() => setIsInviteOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer select-none"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              
              <div className="border-b border-slate-200 pb-3 mb-4 select-none">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Credential Registry</span>
                <h3 className="font-serif font-bold text-lg text-slate-900 mt-1">
                  Create User Credentials
                </h3>
                <p className="text-xs text-slate-550 mt-0.5 leading-relaxed">Administered users are seeded directly into the MongoDB database.</p>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Full Legal Name *</label>
                <input
                  id="invite-name-input"
                  type="text"
                  required
                  placeholder="e.g. Jane Foster"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-brand-650 px-3.5 py-2 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Email Address *</label>
                <input
                  id="invite-email-input"
                  type="email"
                  required
                  placeholder="jane.foster@spsu.ac.in"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-brand-655 px-3.5 py-2 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Password *</label>
                <input
                  id="invite-password-input"
                  type="password"
                  required
                  placeholder="e.g. Welcome@123"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-brand-650 px-3.5 py-2 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Access Security Class *</label>
                <select
                  id="invite-role-select"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 focus:border-brand-650 p-2.5 rounded-lg text-xs text-slate-900 cursor-pointer font-bold"
                >
                  <option value="Student">Student (Undergraduate Candidate)</option>
                  <option value="Company">Company / Corporate Recruiter</option>
                  <option value="Faculty">Faculty Reviewer</option>
                  <option value="Admin">Academic System Admin</option>
                </select>
              </div>

              {inviteRole === 'Company' && (
                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Associated Sponsor Institution</label>
                  <input
                    id="invite-company-input"
                    type="text"
                    required
                    placeholder="e.g. Stripe, Linear"
                    value={inviteCompany}
                    onChange={(e) => setInviteCompany(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-brand-650 px-3.5 py-2.5 rounded-lg text-xs"
                  />
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 mt-4 select-none">
                <button
                  type="button"
                  id="invite-modal-cancel"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="invite-modal-submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-brand-600 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <span>Create Account</span>
                  <i className="fa-solid fa-check text-xs" />
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
