import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  currentRole: UserRole;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  currentRole
}: SidebarProps) {
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-pie' },
    { id: 'listings', label: 'Placements', icon: 'fa-solid fa-briefcase' },
    { id: 'tracker', label: 'Tracker', icon: 'fa-solid fa-chart-line' },
    { id: 'profile', label: 'My Documents', icon: 'fa-solid fa-file-invoice', roles: ['Student'] },
    { id: 'messages', label: 'Inbox Messages', icon: 'fa-solid fa-envelope' },
    { id: 'admin', label: 'Admin Panel', icon: 'fa-solid fa-shield-halved', roles: ['Admin'] }
  ].filter((item) => !item.roles || item.roles.includes(currentRole));

  return (
    <aside 
      id="sidebar-container"
      className={`h-screen bg-sidebar-bg border-r border-slate-800 flex flex-col justify-between transition-all duration-300 relative select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-850 justify-between">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-md flex items-center justify-center text-white font-bold">
                P
              </div>
              <span className="font-serif text-xl tracking-tight text-white font-semibold">Placera.</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-brand-600 rounded-md flex items-center justify-center text-white font-bold mx-auto">
              P
            </div>
          )}

          {/* Inline Toggle Button (Hover State) */}
          {!collapsed && (
            <button
              id="sidebar-collapse-btn-desktop"
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded hover:bg-slate-800/80 text-slate-400 hover:text-white cursor-pointer transition-colors"
              title="Collapse sidebar"
            >
              <i className="fa-solid fa-chevron-left text-xs" />
            </button>
          )}
        </div>

        {/* User Context Badge (Sidebar Interior) */}
        {!collapsed && (
          <div className="mx-4 mt-5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-editorial-light animate-pulse inline-block" />
              <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                Active Environment
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                Mode: <span className="text-editorial-light font-serif italic font-semibold">{currentRole}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {currentRole === 'Admin' && 'Academic Overseer System'}
                {currentRole === 'Company' && 'Placement & Offers Hub'}
                {currentRole === 'Student' && 'Applicant Career Tracker'}
                {currentRole === 'Faculty' && 'Faculty Verification Desk'}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Map */}
        <nav className="mt-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;

            return (
              <button
                id={`sidebar-nav-${item.id}`}
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative group cursor-pointer border ${
                  isActive
                    ? 'bg-brand-600/20 border-brand-500/40 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border-transparent'
                }`}
              >
                <div className="w-5 flex items-center justify-center">
                  <i className={`${item.icon} text-[15px] ${isActive ? 'text-brand-100' : 'text-slate-400 group-hover:text-white'}`} />
                </div>
                
                {!collapsed && (
                  <span className="truncate flex-1 text-left">
                    {item.label}
                  </span>
                )}

                {/* Micro tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-16 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md font-sans whitespace-nowrap z-50 border border-slate-800">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer / Collapse Controller */}
      <div className="p-4 border-t border-slate-850 bg-transparent">
        {collapsed ? (
          <button
            id="sidebar-expand-btn"
            onClick={() => setCollapsed(false)}
            className="w-full h-10 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 flex items-center justify-center transition-colors cursor-pointer"
            title="Expand sidebar"
          >
            <i className="fa-solid fa-chevron-right text-sm" />
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 p-1">
              <span className="h-7 w-7 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400">
                <i className="fa-solid fa-wand-magic-sparkles text-xs animate-pulse" />
              </span>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-medium text-slate-200 truncate">Academic Term</p>
                <p className="text-[10px] text-slate-400 font-mono">Summer 2026</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
