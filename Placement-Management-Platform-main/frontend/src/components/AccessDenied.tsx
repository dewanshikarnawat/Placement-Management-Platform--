import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

interface AccessDeniedProps {
  currentRole: UserRole;
  allowedRoles: UserRole[];
}

export default function AccessDenied({ currentRole, allowedRoles }: AccessDeniedProps) {
  const navigate = useNavigate();

  const handleReturn = () => {
    // Navigate back to the user's dashboard based on their role
    const rolePath = currentRole.toLowerCase();
    if (rolePath === 'admin') {
      navigate('/admin/panel');
    } else {
      navigate(`/${rolePath}/dashboard`);
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-white border border-brand-100 rounded-3xl p-8 shadow-xl purple-glow space-y-6">
        
        {/* Animated Warning Icon */}
        <div className="h-16 w-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto border border-brand-100 shadow-sm animate-pulse">
          <i className="fa-solid fa-shield-halved text-2xl" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h2 className="font-display font-bold text-2xl text-editorial tracking-tight">
            Access Restricted
          </h2>
          <p className="text-xs text-text-muted leading-relaxed max-w-sm mx-auto">
            You do not have the required security credentials to access this section of the SPSU placement portal.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-brand-50/50 border border-brand-100/60 rounded-2xl p-4 text-left space-y-2 text-xs font-sans">
          <div className="flex justify-between items-center">
            <span className="text-text-light uppercase tracking-wider font-mono text-[10px]">Your Current Role</span>
            <span className="font-bold text-brand-700 bg-brand-100 border border-brand-200/50 px-2 py-0.5 rounded-md uppercase text-[9px] tracking-wide">
              {currentRole}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-brand-100/40 pt-2">
            <span className="text-text-light uppercase tracking-wider font-mono text-[10px]">Permitted Access Class</span>
            <span className="font-bold text-editorial font-mono text-[10px]">
              {allowedRoles.join(' / ')}
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleReturn}
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-brand-500/15 hover:shadow-brand-500/25 active:scale-98"
        >
          Return to My Dashboard
        </button>

      </div>
    </div>
  );
}
