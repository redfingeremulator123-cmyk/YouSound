import React, { useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Megaphone, AlertTriangle, Music, X, Check } from 'lucide-react';

export const PopupDisplay: React.FC = () => {
  const { activePopups, dismissPopup } = useAuth();

  const handleDismissCurrent = useCallback(() => {
    if (activePopups.length > 0) {
      dismissPopup(activePopups[0].id);
    }
  }, [activePopups, dismissPopup]);

  const handleDismissAll = useCallback(() => {
    activePopups.forEach((p) => dismissPopup(p.id));
  }, [activePopups, dismissPopup]);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (activePopups.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismissCurrent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePopups.length, handleDismissCurrent]);

  if (activePopups.length === 0) return null;

  // Show top active popup
  const currentPopup = activePopups[0];

  const getIcon = () => {
    switch (currentPopup.type) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'music':
        return <Music className="w-5 h-5 text-cyan-400" />;
      default:
        return <Megaphone className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div
      onClick={handleDismissCurrent}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      {/* Liquid Glass Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md liquid-glass-surface rounded-3xl p-6 sm:p-7 border border-cyan-400/40 shadow-[0_16px_50px_rgba(6,182,212,0.25)] animate-in zoom-in-95 duration-200 overflow-hidden"
      >
        {/* Iridescent shimmer bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center shadow-inner">
              {getIcon()}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-300 font-mono">
                Admin Broadcast
              </span>
              <h3 className="text-base font-bold text-white font-display">
                {currentPopup.title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleDismissCurrent}
            className="p-1.5 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
            title="Dismiss popup (ESC)"
            aria-label="Dismiss popup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message body */}
        <div className="my-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-slate-200 leading-relaxed">
          {currentPopup.message}
        </div>

        {/* Action Button Row */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
          {activePopups.length > 1 ? (
            <button
              onClick={handleDismissAll}
              className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              Dismiss all ({activePopups.length})
            </button>
          ) : (
            <span className="text-[11px] text-slate-500">Press ESC or click outside to close</span>
          )}

          <button
            onClick={handleDismissCurrent}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Check className="w-3.5 h-3.5" />
            Got It, Thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
