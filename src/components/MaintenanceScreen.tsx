import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wrench, Shield, Lock, Radio, Sparkles, Clock, AlertTriangle } from 'lucide-react';

interface MaintenanceScreenProps {
  onOpenAdminAuth: () => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ onOpenAdminAuth }) => {
  const { maintenanceState } = useAuth();
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    if (!maintenanceState.hasCountdown || !maintenanceState.estimatedFinishTime) {
      return;
    }

    const updateCountdown = () => {
      const targetTime = new Date(maintenanceState.estimatedFinishTime!).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isPast: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isPast: false });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [maintenanceState.hasCountdown, maintenanceState.estimatedFinishTime]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#060814] overflow-hidden text-slate-100">
      {/* Liquid background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] animate-orb-1 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px] animate-orb-2 pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-xl liquid-glass-surface rounded-3xl p-8 sm:p-12 border border-amber-400/30 shadow-[0_20px_70px_rgba(245,158,11,0.15)] text-center">
        {/* Top App Version Name */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs text-cyan-300 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>YouSong · by LiamDev12027</span>
        </div>

        {/* Center Glowing Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-[0_0_40px_rgba(245,158,11,0.4)] mb-6 animate-bounce">
          <Wrench className="w-9 h-9" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight mb-2">
          Maintenance Mode Active
        </h1>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          Audio Hub Server Updates in Progress
        </div>

        {/* Optional Live Countdown Timer */}
        {maintenanceState.hasCountdown && maintenanceState.estimatedFinishTime && (
          <div className="mb-6 p-5 rounded-2xl liquid-glass-surface border border-cyan-400/30 bg-cyan-950/20 shadow-lg">
            <div className="flex items-center justify-center gap-1.5 text-xs text-cyan-300 font-semibold mb-3">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Estimated Return In:</span>
            </div>

            {timeLeft.isPast ? (
              <div className="text-emerald-400 font-bold text-sm flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Updates finishing up · Streams restarting any second!
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-cyan-400/40 text-2xl sm:text-3xl font-mono font-bold text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    {pad(timeLeft.hours)}
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Hours</span>
                </div>
                <span className="text-2xl font-mono text-cyan-400 animate-pulse -mt-4">:</span>
                <div className="flex flex-col items-center">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-cyan-400/40 text-2xl sm:text-3xl font-mono font-bold text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    {pad(timeLeft.minutes)}
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Minutes</span>
                </div>
                <span className="text-2xl font-mono text-cyan-400 animate-pulse -mt-4">:</span>
                <div className="flex flex-col items-center">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-cyan-400/40 text-2xl sm:text-3xl font-mono font-bold text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    {pad(timeLeft.seconds)}
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Seconds</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom Message from Admin */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-sm text-slate-300 max-w-md mx-auto leading-relaxed mb-8">
          "{maintenanceState.message || 'We are currently updating our audio servers. Please check back shortly!'}"
        </div>

        {/* Footer Admin Unlock */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500">
            School network stream will resume automatically.
          </span>

          <button
            onClick={onOpenAdminAuth}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            Admin Unlock
          </button>
        </div>
      </div>
    </div>
  );
};
