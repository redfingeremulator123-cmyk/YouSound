import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import {
  X,
  User,
  KeyRound,
  Shield,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Lock,
  ListMusic,
  Heart,
  HelpCircle,
} from 'lucide-react';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, changeOwnPassword, logout, isAdmin } = useAuth();
  const { userPlaylists, userFavorites } = useAudio();

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPass || !newPass) {
      setErrorMsg('Please enter both your current password and new password.');
      return;
    }

    if (newPass !== confirmPass) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    if (newPass.length < 4) {
      setErrorMsg('New password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    const res = await changeOwnPassword(currentPass, newPass);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Your password has been updated successfully!');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      setErrorMsg(res.error || 'Failed to update password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md liquid-glass-surface rounded-3xl p-6 sm:p-7 border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-slate-950 font-bold text-base shadow-lg">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Account Settings</h3>
              <p className="text-xs text-slate-400">Manage credentials & profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Info Card */}
        <div className="my-5 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Username</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white">{currentUser.username}</span>
              {isAdmin && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/20">
                  Admin
                </span>
              )}
            </div>
          </div>

          {/* Username restriction notice */}
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-start gap-2 text-[11px] text-cyan-200">
            <HelpCircle className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
            <span>
              Your username is locked for security. If you need a username change, please contact the site Administrator.
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
            <div className="p-2 rounded-xl bg-white/[0.02] flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-xs font-bold text-white">{userPlaylists.length}</div>
                <div className="text-[10px] text-slate-400">Playlists</div>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02] flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <div>
                <div className="text-xs font-bold text-white">{userFavorites.length}</div>
                <div className="text-[10px] text-slate-400">Favorites</div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div className="flex items-center gap-1.5 pb-1 text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            Change Password
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="Current password"
              className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="New password"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Confirm
              </label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Confirm new"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 font-semibold text-xs transition-all disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>

        {/* Footer Logout */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-slate-500">Finished session?</span>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
