import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import {
  Music2,
  Sparkles,
  Shield,
  User as UserIcon,
  LogOut,
  LogIn,
  Search,
  SlidersHorizontal,
  Flame,
  Heart,
  ListMusic,
  Radio,
  ListPlus,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'library' | 'playlists' | 'favorites' | 'admin';
  setActiveTab: (tab: 'library' | 'playlists' | 'favorites' | 'admin') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  onOpenAuth: () => void;
  onOpenAccount: () => void;
  onOpenSongRequest: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre,
  onOpenAuth,
  onOpenAccount,
  onOpenSongRequest,
}) => {
  const { currentUser, isAdmin, logout, bannerConfig } = useAuth();
  const { userFavorites, userPlaylists } = useAudio();

  // Get theme gradient style based on admin banner settings
  const getThemeBadgeClass = () => {
    switch (bannerConfig.colorTheme) {
      case 'emerald-cyber':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30';
      case 'amber-rose':
        return 'bg-amber-500/15 text-amber-300 border-amber-400/30';
      case 'sapphire-ice':
        return 'bg-blue-500/15 text-blue-300 border-blue-400/30';
      case 'ruby-glow':
        return 'bg-rose-500/15 text-rose-300 border-rose-400/30';
      case 'midnight-mono':
        return 'bg-slate-700/30 text-slate-300 border-slate-500/30';
      case 'cyan-violet':
      default:
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-400/20';
    }
  };

  const getBrandIconGlow = () => {
    switch (bannerConfig.colorTheme) {
      case 'emerald-cyber':
        return 'from-emerald-500/30 via-teal-500/20 to-cyan-500/30 border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]';
      case 'amber-rose':
        return 'from-amber-500/30 via-orange-500/20 to-rose-500/30 border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.3)]';
      case 'sapphire-ice':
        return 'from-blue-500/30 via-cyan-500/20 to-indigo-500/30 border-blue-400/40 shadow-[0_0_20px_rgba(59,130,246,0.3)]';
      case 'ruby-glow':
        return 'from-rose-500/30 via-red-500/20 to-pink-500/30 border-rose-400/40 shadow-[0_0_20px_rgba(244,63,94,0.3)]';
      case 'midnight-mono':
        return 'from-slate-700/30 to-slate-900 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]';
      case 'cyan-violet':
      default:
        return 'from-cyan-500/30 via-indigo-500/20 to-fuchsia-500/30 border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full liquid-glass-surface border-b border-white/10 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand & Top Version Name */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('library')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-tr p-[1px] border transition-all ${getBrandIconGlow()}`}
              >
                <div className="w-full h-full rounded-[11px] bg-slate-950/80 backdrop-blur-md flex items-center justify-center">
                  <Music2 className="w-5 h-5 text-cyan-300 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-white font-display">
                    YouSong
                  </span>
                  {bannerConfig.enabled && (
                    <span
                      className={`text-[11px] font-medium tracking-wide px-2 py-0.5 rounded-full border shadow-sm animate-pulse ${getThemeBadgeClass()}`}
                    >
                      {bannerConfig.versionName || 'v2.5 Liquid Crystal'}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 hidden sm:block">
                  {bannerConfig.sloganText || 'School Audio Stream Hub · by LiamDev12027'}
                </div>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10">
            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'library'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-200 border border-cyan-400/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Music Library
            </button>

            <button
              onClick={() => setActiveTab('playlists')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'playlists'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-200 border border-cyan-400/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              Playlists ({userPlaylists.length})
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'favorites'
                  ? 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-200 border border-rose-400/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Favorites ({userFavorites.length})
            </button>

            {/* Request a Song Button for all users */}
            <button
              onClick={onOpenSongRequest}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-cyan-300 hover:text-white hover:bg-cyan-500/10 transition-all border border-cyan-400/20"
              title="Request LiamDev12027 to add a song"
            >
              <ListPlus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Request Song</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200 border border-amber-400/30 shadow-sm'
                    : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Admin Panel
              </button>
            )}
          </nav>

          {/* Zone 3: Search & User Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search songs, artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-32 sm:w-56 pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:w-48 sm:focus:w-64 focus:bg-white/[0.08] transition-all"
                />
              </div>
            </div>

            {/* Request Song icon for mobile */}
            <button
              onClick={onOpenSongRequest}
              className="md:hidden p-1.5 rounded-xl bg-white/[0.06] text-cyan-300 border border-white/10"
              title="Request a Song"
            >
              <ListPlus className="w-4 h-4" />
            </button>

            {/* Auth / Account Profile */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAccount}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs text-slate-200 transition-all hover:border-cyan-400/30"
                  title="Account Settings & Password"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-slate-950">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[80px] sm:max-w-[110px] truncate font-medium">
                    {currentUser.username}
                  </span>
                  {isAdmin && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/20">
                      Admin
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-[0_0_16px_rgba(6,182,212,0.3)] hover:shadow-[0_0_24px_rgba(6,182,212,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Request</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-white/5 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap ${
              activeTab === 'library' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Library
          </button>
          <button
            onClick={() => setActiveTab('playlists')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap ${
              activeTab === 'playlists' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Playlists ({userPlaylists.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap ${
              activeTab === 'favorites' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400'
            }`}
          >
            Favorites ({userFavorites.length})
          </button>
          <button
            onClick={onOpenSongRequest}
            className="px-2.5 py-1 text-xs rounded-lg whitespace-nowrap text-cyan-300 bg-cyan-500/10"
          >
            Request Song
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap ${
                activeTab === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'text-amber-400'
              }`}
            >
              Admin
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
