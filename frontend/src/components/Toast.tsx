import React from 'react';
import { ToastMessage } from '../types';

interface ToastListProps {
  toasts: ToastMessage[];
  onCloseToast: (id: string) => void;
}

export default function ToastList({ toasts, onCloseToast }: ToastListProps) {
  if (toasts.length === 0) return null;

  return (
    <div 
      id="toast-stack-container"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3.5 max-w-sm w-full select-none pointer-events-none"
    >
      {toasts.map((toast) => {
        let iconClass = 'fa-solid fa-circle-check text-emerald-600';
        let colorClass = 'border-emerald-200 bg-emerald-50 text-emerald-900';
        if (toast.type === 'error') {
          iconClass = 'fa-solid fa-circle-xmark text-rose-600';
          colorClass = 'border-rose-200 bg-rose-50 text-rose-900';
        } else if (toast.type === 'info') {
          iconClass = 'fa-solid fa-circle-info text-brand-600';
          colorClass = 'border-indigo-150 bg-indigo-50 text-indigo-900';
        }

        return (
          <div
            key={toast.id}
            id={`toast-item-${toast.id}`}
            className={`pointer-events-auto border rounded-xl p-4 shadow-lg flex items-start gap-3 transition-all duration-300 transform translate-y-0 scale-100 bg-white ${colorClass} animate-fadeInUp`}
          >
            <div className="shrink-0 mt-0.5">
              <i className={`${iconClass} text-sm`} />
            </div>
            
            <div className="flex-1 text-left">
              <h5 className="text-xs font-semibold font-sans leading-none">{toast.title}</h5>
              <p className="text-[11px] font-sans opacity-95 leading-normal mt-1 pr-2">{toast.text}</p>
            </div>

            <button
              id={`close-toast-${toast.id}`}
              onClick={() => onCloseToast(toast.id)}
              className="p-0.5 rounded hover:bg-black/5 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
              title="Close notification"
            >
              <i className="fa-solid fa-xmark text-xs" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
