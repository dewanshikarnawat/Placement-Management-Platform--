import React, { useState } from 'react';
import { UserRole, UserProfile } from '../types';

interface TopBarProps {
  currentRole: UserRole;
  currentUser: UserProfile;
  onLogout: () => void;
  unreceivedCount: number;
  triggerToast: (title: string, text: string, type: 'success' | 'info' | 'error') => void;
}

export default function TopBar({
  currentRole,
  currentUser,
  onLogout,
  unreceivedCount,
  triggerToast
}: TopBarProps) {
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Generically formatted system notification logs
  const systemNotifications = [
    { id: 'n1', text: 'Application reviewed stage updated to "Applied"', time: 'Just now', read: false },
    { id: 'n2', text: 'Database transactions securely persisted in MongoDB', time: '10m ago', read: false },
    { id: 'n3', text: 'Placement services initialized', time: '1h ago', read: true }
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between relative select-none">
      
      {/* Brand Context Header */}
      <div className="flex items-center gap-3 text-left">
        <h2 className="text-xs text-slate-500 font-sans">
          Welcome back, <span className="font-semibold text-slate-900">{currentUser.name}</span>
        </h2>
      </div>

      {/* Action Controls - Notifications, User Profile Badge, Logout button */}
      <div className="flex items-center gap-4">
        
        {/* User Context Card (Static Role Display) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-brand-600">
          {currentRole === 'Admin' && <i className="fa-solid fa-user-shield text-[13px]" />}
          {currentRole === 'Company' && <i className="fa-solid fa-building text-[13px]" />}
          {currentRole === 'Student' && <i className="fa-solid fa-graduation-cap text-[13px]" />}
          <span className="font-sans leading-none ml-1">{currentRole} Mode</span>
        </div>

        {/* Dynamic Notification Bell */}
        <div className="relative">
          <button
            id="notification-bell"
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
            }}
            className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-50 rounded-lg relative cursor-pointer transition-colors"
          >
            <i className="fa-solid fa-bell text-[16px]" />
            {unreceivedCount > 0 && (
              <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-brand-600 text-white rounded-full text-[8px] font-bold flex items-center justify-center animate-pulse">
                {unreceivedCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-250 rounded-xl shadow-lg z-50 py-2 outline-none">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900 font-serif">Notifications</span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-50 py-0.5 px-2 rounded border border-slate-200">
                  Real-time Status
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {systemNotifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50/50 transition-colors flex flex-col gap-1 text-left">
                    <div className="flex justify-between items-start">
                      <p className="text-xs text-slate-905 font-sans leading-normal pr-3">{n.text}</p>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 bg-brand-600 rounded-full shrink-0 mt-1 animate-ping" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 text-center bg-slate-50">
                <button
                  onClick={() => {
                    setNotifDropdownOpen(false);
                    triggerToast('Clean Sweep', 'Notifications marked as read.', 'info');
                  }}
                  className="text-[11px] font-semibold text-brand-600 hover:underline cursor-pointer"
                >
                  Clear notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Circle */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          {currentUser.avatarUrl ? (
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.name} 
              className="h-8 w-8 rounded-full object-cover shadow-inner select-none border border-slate-200"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-brand-600 text-white font-semibold flex items-center justify-center font-serif shadow-inner select-none">
              {currentUser.name.charAt(0)}
            </div>
          )}
          <div className="hidden lg:flex flex-col select-none text-left">
            <span className="text-xs font-semibold text-slate-900 leading-none">{currentUser.name}</span>
            <span className="text-[10px] text-slate-450 mt-0.5 max-w-[120px] truncate">{currentUser.email}</span>
          </div>
        </div>

        {/* Premium Sign Out Button */}
        <button
          onClick={onLogout}
          id="logout-header-btn"
          title="Sign out of portal session"
          className="p-2 text-slate-400 hover:text-red-655 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
        >
          <i className="fa-solid fa-arrow-right-from-bracket text-[15px]" />
        </button>

      </div>
    </header>
  );
}
