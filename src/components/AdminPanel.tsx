import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { generateToneWavUrl } from '../utils/audioGenerator';
import { Song, User, PopupType, BannerColorTheme, SongRequest } from '../types';
import { EditSongModal } from './EditSongModal';
import {
  Shield,
  Music,
  Users,
  UserCheck,
  AlertTriangle,
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Sparkles,
  Link as LinkIcon,
  Upload,
  Cpu,
  KeyRound,
  Send,
  Play,
  Clock,
  ListPlus,
  ExternalLink,
  Tag,
  Palette,
  FileAudio,
} from 'lucide-react';

const COVER_PRESETS = [
  { name: 'Turquoise Ripples', url: '/src/assets/images/chill_ambient_wave_1791054604455.jpg' },
  { name: 'Study Desk Glass', url: '/src/assets/images/lofi_study_glass_1791054585559.jpg' },
  { name: 'Synthwave Prism', url: '/src/assets/images/synthwave_prism_sound_1791054595636.jpg' },
  { name: 'Electric Pulse', url: '/src/assets/images/electric_energy_liquid_1791054613304.jpg' },
];

export const AdminPanel: React.FC = () => {
  const {
    allUsers,
    approveAccount,
    rejectAccount,
    adminUpdateUser,
    adminDeleteUser,
    maintenanceState,
    setMaintenance,
    bannerConfig,
    updateBannerConfig,
    songRequests,
    updateSongRequestStatus,
    deleteSongRequest,
    allPopups,
    createBroadcastPopup,
    deletePopup,
  } = useAuth();

  const { allSongs, addNewSong, deleteSong, updateSong, playSong, clearAllSongs } = useAudio();

  const [adminTab, setAdminTab] = useState<
    'songs' | 'requests' | 'banner' | 'approvals' | 'users' | 'maintenance' | 'popups'
  >('songs');

  // Song Studio State
  const [uploadMode, setUploadMode] = useState<'upload' | 'url' | 'synth'>('upload');
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newGenre, setNewGenre] = useState('Lo-Fi');
  const [newTags, setNewTags] = useState('study, focus');
  const [newAlbum, setNewAlbum] = useState('Single');
  const [newAudioUrl, setNewAudioUrl] = useState('');
  const [newCoverUrl, setNewCoverUrl] = useState(COVER_PRESETS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [coverMode, setCoverMode] = useState<'preset' | 'url' | 'file'>('preset');
  const [newDuration, setNewDuration] = useState(210);
  const [songFeedback, setSongFeedback] = useState<string | null>(null);

  // Edit Song Modal State
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  // Edit User State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editTempPassword, setEditTempPassword] = useState('');
  const [userEditFeedback, setUserEditFeedback] = useState<string | null>(null);

  // Maintenance State with Countdown
  const [maintEnabled, setMaintEnabled] = useState(maintenanceState.enabled);
  const [maintMessage, setMaintMessage] = useState(maintenanceState.message);
  const [maintHasCountdown, setMaintHasCountdown] = useState(!!maintenanceState.hasCountdown);
  const [maintFinishTime, setMaintFinishTime] = useState(
    maintenanceState.estimatedFinishTime
      ? new Date(maintenanceState.estimatedFinishTime).toISOString().slice(0, 16)
      : ''
  );
  const [maintFeedback, setMaintFeedback] = useState<string | null>(null);

  // Banner & Branding State
  const [bannerEnabled, setBannerEnabled] = useState(bannerConfig.enabled);
  const [bannerVersion, setBannerVersion] = useState(bannerConfig.versionName);
  const [bannerSlogan, setBannerSlogan] = useState(bannerConfig.sloganText);
  const [bannerTheme, setBannerTheme] = useState<BannerColorTheme>(bannerConfig.colorTheme);
  const [bannerRibbonEnabled, setBannerRibbonEnabled] = useState(bannerConfig.ribbonEnabled);
  const [bannerRibbonNotice, setBannerRibbonNotice] = useState(bannerConfig.ribbonNotice);
  const [bannerFeedback, setBannerFeedback] = useState<string | null>(null);

  // Popups State
  const [popupTarget, setPopupTarget] = useState<'all' | string>('all');
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<PopupType>('announcement');
  const [popupFeedback, setPopupFeedback] = useState<string | null>(null);

  const pendingUsers = allUsers.filter((u) => !u.isApproved);
  const approvedUsers = allUsers.filter((u) => u.isApproved);
  const pendingRequests = songRequests.filter((r) => r.status === 'pending');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  // Dynamic Genres calculation
  const activeGenres = Array.from(new Set(allSongs.map((s) => s.genre).filter(Boolean))).sort();

  // Process MP3 / Audio file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    setNewTitle(cleanTitle);
    if (!newArtist) setNewArtist('Admin Upload');

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      setNewAudioUrl(dataUri);

      // Auto-detect duration
      const audio = new Audio();
      audio.src = dataUri;
      audio.onloadedmetadata = () => {
        if (audio.duration && isFinite(audio.duration)) {
          setNewDuration(Math.round(audio.duration));
        }
      };
      setSongFeedback(`Loaded audio file: "${file.name}"! Fill details and click Publish.`);
    };
    reader.readAsDataURL(file);
  };

  // Custom cover upload
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setNewCoverUrl(event.target?.result as string);
      setSongFeedback('Custom cover image loaded!');
    };
    reader.readAsDataURL(file);
  };

  // Manual Publish Handler
  const handleManualPublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newArtist.trim() || !newAudioUrl.trim()) {
      setSongFeedback('Please provide a Song Title, Artist, and load an audio file or URL.');
      return;
    }

    const parsedTags = newTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const published = addNewSong({
      title: newTitle.trim(),
      artist: newArtist.trim(),
      album: newAlbum.trim() || 'Single',
      genre: newGenre.trim() || 'General',
      tags: parsedTags.length > 0 ? parsedTags : [newGenre.trim().toLowerCase()],
      duration: Number(newDuration) || 180,
      audioUrl: newAudioUrl.trim(),
      coverUrl: newCoverUrl.trim() || COVER_PRESETS[0].url,
      featured: true,
    });

    setSongFeedback(`Successfully published "${published.title}" by ${published.artist} (${published.genre})!`);
    setNewTitle('');
    setNewArtist('');
    setNewAudioUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setSongFeedback(null), 3500);
  };

  // Web Audio Tone Synthesizer
  const handleGenerateSynthTone = (type: 'lofi' | 'synthwave' | 'ambient' | 'chill') => {
    const toneDataUri = generateToneWavUrl(440, 24, type);
    const titleMap = {
      lofi: 'Procedural Rain Study Chords',
      synthwave: 'Liquid Neon Cyber Pulse',
      ambient: 'Crystal Waters Relaxation',
      chill: 'Golden Afternoon Chimes',
    };
    const coverMap = {
      lofi: COVER_PRESETS[1].url,
      synthwave: COVER_PRESETS[2].url,
      ambient: COVER_PRESETS[0].url,
      chill: COVER_PRESETS[3].url,
    };
    const genreMap = {
      lofi: 'Lo-Fi',
      synthwave: 'Synthwave',
      ambient: 'Ambient',
      chill: 'Acoustic',
    };

    addNewSong({
      title: titleMap[type],
      artist: 'YouSong Tone Synthesizer',
      album: 'Procedural Series',
      genre: genreMap[type],
      tags: ['synthesized', genreMap[type].toLowerCase(), 'study'],
      duration: 24,
      audioUrl: toneDataUri,
      coverUrl: coverMap[type],
      featured: true,
    });

    setSongFeedback(`Synthesized and added "${titleMap[type]}" to library!`);
    setTimeout(() => setSongFeedback(null), 3000);
  };

  // Save User Edit
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUserEditFeedback(null);

    const res = await adminUpdateUser(editingUser.id, editUsername, editTempPassword);
    if (res.success) {
      setUserEditFeedback('User updated successfully!');
      setTimeout(() => {
        setEditingUser(null);
        setEditUsername('');
        setEditTempPassword('');
        setUserEditFeedback(null);
      }, 1500);
    } else {
      setUserEditFeedback(res.error || 'Failed to update user.');
    }
  };

  // Save Maintenance with Countdown
  const handleSaveMaintenance = () => {
    const isoFinishTime =
      maintHasCountdown && maintFinishTime ? new Date(maintFinishTime).toISOString() : null;

    setMaintenance(maintEnabled, maintMessage, maintHasCountdown, isoFinishTime);
    setMaintFeedback('Maintenance settings and countdown timer saved!');
    setTimeout(() => setMaintFeedback(null), 3000);
  };

  const setQuickMinutes = (mins: number) => {
    const target = new Date(Date.now() + mins * 60 * 1000);
    setMaintHasCountdown(true);
    setMaintFinishTime(target.toISOString().slice(0, 16));
  };

  // Save Banner & Branding
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    updateBannerConfig({
      enabled: bannerEnabled,
      versionName: bannerVersion,
      sloganText: bannerSlogan,
      colorTheme: bannerTheme,
      ribbonEnabled: bannerRibbonEnabled,
      ribbonNotice: bannerRibbonNotice,
    });
    setBannerFeedback('Branding and top banner settings updated across the site!');
    setTimeout(() => setBannerFeedback(null), 3000);
  };

  // Broadcast Popup
  const handleSendPopup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!popupTitle.trim() || !popupMessage.trim()) {
      setPopupFeedback('Please enter both title and message.');
      return;
    }

    createBroadcastPopup(popupTarget, popupTitle, popupMessage, popupType);
    setPopupFeedback('Popup broadcast sent successfully!');
    setPopupTitle('');
    setPopupMessage('');
    setTimeout(() => setPopupFeedback(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Admin Top Header Banner */}
      <div className="relative liquid-glass-surface rounded-3xl p-6 sm:p-8 border border-amber-400/30 shadow-[0_12px_40px_rgba(245,158,11,0.1)] mb-8 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white font-display">
                  YouSong Administrator Studio
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  by LiamDev12027
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Upload your MP3s, configure streaming URLs, manage student accounts, configure maintenance mode, and manage school requests.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300 bg-white/[0.04] p-3 rounded-2xl border border-white/10">
            <div>
              <span className="text-white font-bold">{allSongs.length}</span> Songs
            </div>
            <span className="text-slate-600">·</span>
            <div>
              <span className="text-amber-400 font-bold">{pendingRequests.length}</span> Requests
            </div>
            <span className="text-slate-600">·</span>
            <div>
              <span className="text-cyan-400 font-bold">{pendingUsers.length}</span> Pending Approvals
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 mt-6 pt-4 border-t border-white/10 overflow-x-auto">
          <button
            onClick={() => setAdminTab('songs')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              adminTab === 'songs'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            Song Studio & Catalog ({allSongs.length})
          </button>

          <button
            onClick={() => setAdminTab('requests')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all relative ${
              adminTab === 'requests'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <ListPlus className="w-3.5 h-3.5" />
            Song Requests
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('banner')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              adminTab === 'banner'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Banner & Branding
          </button>

          <button
            onClick={() => setAdminTab('approvals')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all relative ${
              adminTab === 'approvals'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Account Approvals
            {pendingUsers.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {pendingUsers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('users')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              adminTab === 'users'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Users ({approvedUsers.length})
          </button>

          <button
            onClick={() => setAdminTab('maintenance')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              adminTab === 'maintenance'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Maintenance & Countdown {maintenanceState.enabled ? '(ACTIVE)' : ''}
          </button>

          <button
            onClick={() => setAdminTab('popups')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              adminTab === 'popups'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            Broadcast Pop-ups
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {songFeedback && (
        <div className="mb-6 p-4 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{songFeedback}</span>
          </div>
          <button
            onClick={() => setSongFeedback(null)}
            className="text-cyan-400 hover:text-white text-xs underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: SONG STUDIO & CATALOG */}
      {adminTab === 'songs' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Active Genres Indicator */}
          <div className="liquid-glass-surface rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300 font-semibold">Active Selection Tab Genres:</span>
              <div className="flex flex-wrap gap-1.5 ml-1">
                {activeGenres.length === 0 ? (
                  <span className="text-slate-500 italic">None yet (Upload your first song)</span>
                ) : (
                  activeGenres.map((g) => {
                    const count = allSongs.filter((s) => s.genre === g).length;
                    return (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-200 border border-cyan-400/20 font-medium text-[11px]"
                      >
                        {g} ({count})
                      </span>
                    );
                  })
                )}
              </div>
            </div>
            <span className="text-[11px] text-slate-400">
              * Any non-existing genre or modified genre is automatically removed from library tabs.
            </span>
          </div>

          {/* Manual Song Upload Form */}
          <div className="liquid-glass-surface rounded-3xl p-6 sm:p-7 border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  <Upload className="w-5 h-5 text-cyan-400" />
                  Manual Song Upload Studio
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload audio files from your device, add direct audio links, or synthesize ambient study tones.
                </p>
              </div>

              {/* Upload Mode Selector */}
              <div className="flex p-1 rounded-xl bg-white/[0.05] border border-white/10 text-xs gap-1">
                <button
                  type="button"
                  onClick={() => setUploadMode('upload')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    uploadMode === 'upload'
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileAudio className="w-3.5 h-3.5" />
                  <span>Upload MP3 File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    uploadMode === 'url'
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Direct Audio URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('synth')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    uploadMode === 'synth'
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Tone Synthesizer</span>
                </button>
              </div>
            </div>

            {/* Mode 1: File Upload */}
            {uploadMode === 'upload' && (
              <div className="space-y-4 mb-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 rounded-2xl border-2 border-dashed border-white/20 hover:border-cyan-400/50 bg-white/[0.02] hover:bg-white/[0.04] text-center cursor-pointer transition-all"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
                  {newAudioUrl && !newAudioUrl.startsWith('http') ? (
                    <div>
                      <span className="text-emerald-300 font-bold text-sm">
                        Audio file loaded! Customize song details below.
                      </span>
                      <p className="text-xs text-slate-400 mt-1">Click to select a different MP3</p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Click to browse or drag and drop your MP3 file here
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">MP3, WAV, M4A, OGG supported</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mode 2: Direct URL */}
            {uploadMode === 'url' && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Audio Stream MP3 URL *
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/audio.mp3"
                  value={newAudioUrl}
                  onChange={(e) => setNewAudioUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
                />
              </div>
            )}

            {/* Mode 3: Synthesizer */}
            {uploadMode === 'synth' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { type: 'lofi' as const, title: 'Lo-Fi Rain Chords', desc: 'Relaxed vinyl study loops' },
                  { type: 'ambient' as const, title: 'Ambient Waters', desc: 'Soothing crystal ripple tones' },
                  { type: 'synthwave' as const, title: 'Cyber Pulse', desc: 'Retro electronic bassline' },
                  { type: 'chill' as const, title: 'Acoustic Study', desc: 'Warm gentle acoustic focus' },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleGenerateSynthTone(item.type)}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/40 text-left transition-all active:scale-95"
                  >
                    <Cpu className="w-6 h-6 text-cyan-400 mb-2" />
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
                    <span className="mt-3 inline-block text-[11px] text-cyan-300 font-semibold">
                      + Synthesize & Add
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Form details for Upload / URL */}
            {uploadMode !== 'synth' && (
              <form onSubmit={handleManualPublish} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Song Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Moonlight Sonata"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Artist / Composer *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Beethoven"
                      value={newArtist}
                      onChange={(e) => setNewArtist(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Genre *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Piano, Classical, Lo-Fi, Rock"
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. piano, study, relaxing"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Album
                    </label>
                    <input
                      type="text"
                      placeholder="Single or Album Name"
                      value={newAlbum}
                      onChange={(e) => setNewAlbum(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Duration (Seconds)
                    </label>
                    <input
                      type="number"
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Album Cover Art */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Cover Artwork
                  </label>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setCoverMode('preset')}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                        coverMode === 'preset' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' : 'text-slate-400 border-white/10'
                      }`}
                    >
                      Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverMode('url')}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                        coverMode === 'url' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' : 'text-slate-400 border-white/10'
                      }`}
                    >
                      Image URL
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCoverMode('file');
                        coverInputRef.current?.click();
                      }}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                        coverMode === 'file' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' : 'text-slate-400 border-white/10'
                      }`}
                    >
                      Upload File
                    </button>
                    <input
                      type="file"
                      ref={coverInputRef}
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                  </div>

                  {coverMode === 'preset' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {COVER_PRESETS.map((item) => (
                        <div
                          key={item.url}
                          onClick={() => setNewCoverUrl(item.url)}
                          className={`p-1 rounded-xl border cursor-pointer transition-all ${
                            newCoverUrl === item.url ? 'border-cyan-400 ring-2 ring-cyan-400/30' : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <img src={item.url} alt={item.name} className="w-full h-14 object-cover rounded-lg" />
                          <span className="text-[10px] text-slate-300 block truncate mt-1 text-center font-medium">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {coverMode === 'url' && (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://... cover image URL"
                        value={customCoverUrl}
                        onChange={(e) => setCustomCoverUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customCoverUrl.trim()) setNewCoverUrl(customCoverUrl.trim());
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/[0.08] text-xs text-cyan-200"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish Song to YouSong</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Full Song Catalog Table with Edit, Delete & Clear All */}
          <div className="liquid-glass-surface rounded-3xl p-6 sm:p-7 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Song Catalog ({allSongs.length} Tracks)
                </h3>
                <p className="text-xs text-slate-400">
                  Manage all songs uploaded by LiamDev12027. Click "Edit" to modify titles, artists, genres, tags, or cover art.
                </p>
              </div>

              {allSongs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Delete all songs from library?')) {
                      clearAllSongs();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-400/30 text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Songs</span>
                </button>
              )}
            </div>

            {allSongs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <Music className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                Your library is empty. Upload your first song using the form above!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-3 pl-2">Track</th>
                      <th className="pb-3">Genre</th>
                      <th className="pb-3">Tags</th>
                      <th className="pb-3">Duration</th>
                      <th className="pb-3 pr-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allSongs.map((song) => (
                      <tr key={song.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 pl-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={song.coverUrl}
                              alt={song.title}
                              className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                            />
                            <div className="min-w-0 max-w-[180px] sm:max-w-xs">
                              <h4 className="font-bold text-white truncate">{song.title}</h4>
                              <p className="text-[11px] text-slate-400 truncate">{song.artist}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-200 border border-cyan-400/20 font-medium">
                            {song.genre}
                          </span>
                        </td>
                        <td className="py-3 max-w-[160px] truncate text-[11px] text-slate-400">
                          {song.tags ? song.tags.join(', ') : '—'}
                        </td>
                        <td className="py-3 font-mono text-[11px]">
                          {Math.floor(song.duration / 60)}:
                          {String(Math.floor(song.duration % 60)).padStart(2, '0')}
                        </td>
                        <td className="py-3 pr-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => playSong(song)}
                              className="p-1.5 rounded-lg hover:bg-white/[0.08] text-cyan-300 transition-colors"
                              title="Play Song"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingSong(song)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white transition-all text-xs font-medium border border-white/10"
                              title="Edit song metadata"
                            >
                              <Edit2 className="w-3 h-3 text-cyan-400" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remove "${song.title}" from library?`)) {
                                  deleteSong(song.id);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                              title="Delete Track"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SONG REQUESTS INBOX */}
      {adminTab === 'requests' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="liquid-glass-surface rounded-3xl p-6 sm:p-7 border border-white/10">
            <h2 className="text-lg font-bold text-white font-display mb-2 flex items-center gap-2">
              <ListPlus className="w-5 h-5 text-cyan-400" />
              Student Song Requests ({songRequests.length})
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Songs requested by your school friends. Click "Upload for Request" to populate the form and upload the song for them!
            </p>

            {songRequests.length === 0 ? (
              <div className="py-16 text-center">
                <ListPlus className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No song requests submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {songRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-cyan-400/30 transition-all"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate">{req.songTitle}</h4>
                        {req.status === 'approved' && (
                          <span className="px-2 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                            Approved & Uploaded
                          </span>
                        )}
                        {req.status === 'pending' && (
                          <span className="px-2 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                            Pending
                          </span>
                        )}
                        {req.status === 'declined' && (
                          <span className="px-2 py-0.2 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-400/30">
                            Declined
                          </span>
                        )}
                      </div>

                      {req.artist && (
                        <p className="text-xs text-slate-300">
                          Artist: <strong className="text-cyan-300">{req.artist}</strong>
                        </p>
                      )}

                      {req.notes && (
                        <p className="text-[11px] text-slate-400 italic">
                          "{req.notes}"
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
                        <span>Requested by: <strong className="text-slate-300">{req.requestedByUsername}</strong></span>
                        <span>·</span>
                        <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                        {req.webLink && (
                          <>
                            <span>·</span>
                            <a
                              href={req.webLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Link
                            </a>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setAdminTab('songs');
                          setUploadMode('url');
                          setNewTitle(req.songTitle);
                          if (req.artist) setNewArtist(req.artist);
                          if (req.webLink) setNewAudioUrl(req.webLink);
                          updateSongRequestStatus(req.id, 'approved', 'Uploaded to library by LiamDev12027!');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload for this Request</span>
                      </button>

                      {req.status !== 'approved' && (
                        <button
                          onClick={() => updateSongRequestStatus(req.id, 'approved', 'Approved by LiamDev12027')}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold hover:bg-emerald-500/30 transition-colors"
                        >
                          Mark Approved
                        </button>
                      )}

                      {req.status !== 'declined' && (
                        <button
                          onClick={() => updateSongRequestStatus(req.id, 'declined', 'Declined')}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-200 border border-rose-400/30 text-xs font-semibold hover:bg-rose-500/30 transition-colors"
                        >
                          Decline
                        </button>
                      )}

                      <button
                        onClick={() => deleteSongRequest(req.id)}
                        className="p-1.5 rounded-xl hover:bg-white/[0.08] text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete Request"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BANNER & BRANDING */}
      {adminTab === 'banner' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="liquid-glass-surface rounded-3xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-lg font-bold text-white font-display mb-2 flex items-center gap-2">
              <Palette className="w-5 h-5 text-cyan-400" />
              Top Banner, Versioning & Visual Theme
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Customize version string, custom slogan, banner colors, or toggle the top banner on/off.
            </p>

            {bannerFeedback && (
              <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{bannerFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSaveBanner} className="space-y-6">
              {/* Toggle Banner On/Off */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div>
                  <h4 className="text-xs font-bold text-white">Top Banner Visibility</h4>
                  <p className="text-[11px] text-slate-400">
                    Show or hide the version badge and slogan at the top of the app.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bannerEnabled}
                    onChange={(e) => setBannerEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {/* Version & Slogan Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Version Name Tag
                  </label>
                  <input
                    type="text"
                    value={bannerVersion}
                    onChange={(e) => setBannerVersion(e.target.value)}
                    placeholder="e.g. v2.5 Liquid Crystal"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Slogan / Subtitle
                  </label>
                  <input
                    type="text"
                    value={bannerSlogan}
                    onChange={(e) => setBannerSlogan(e.target.value)}
                    placeholder="e.g. School Audio Stream Hub · by LiamDev12027"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Color Themes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Banner Color Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'cyan-violet' as const, name: 'Cyan & Violet (Default)', colors: 'from-cyan-500 to-indigo-600' },
                    { id: 'emerald-cyber' as const, name: 'Emerald Matrix', colors: 'from-emerald-400 to-teal-600' },
                    { id: 'amber-rose' as const, name: 'Electric Amber & Rose', colors: 'from-amber-400 to-rose-500' },
                    { id: 'sapphire-ice' as const, name: 'Deep Sapphire & Ice', colors: 'from-blue-500 to-cyan-400' },
                    { id: 'ruby-glow' as const, name: 'Ruby Glow Glass', colors: 'from-rose-500 to-red-600' },
                    { id: 'midnight-mono' as const, name: 'Obsidian Monochrome', colors: 'from-slate-700 to-slate-900' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setBannerTheme(theme.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        bannerTheme === theme.id
                          ? 'border-cyan-400 ring-2 ring-cyan-400/30 bg-white/[0.08]'
                          : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                      }`}
                    >
                      <div className={`h-4 rounded-md bg-gradient-to-r ${theme.colors} mb-2`} />
                      <div className="text-xs font-bold text-white">{theme.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ribbon Notice */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Top School Ribbon Notice</h4>
                    <p className="text-[11px] text-slate-400">
                      Announcement ribbon at the top of the music library.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={bannerRibbonEnabled}
                    onChange={(e) => setBannerRibbonEnabled(e.target.checked)}
                    className="rounded border-white/20 bg-slate-900 text-cyan-400"
                  />
                </div>
                {bannerRibbonEnabled && (
                  <input
                    type="text"
                    value={bannerRibbonNotice}
                    onChange={(e) => setBannerRibbonNotice(e.target.value)}
                    placeholder="Notice text..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  Save Branding Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: ACCOUNT APPROVALS */}
      {adminTab === 'approvals' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="liquid-glass-surface rounded-3xl p-6 sm:p-7 border border-white/10">
            <h2 className="text-lg font-bold text-white font-display mb-2 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              Pending Account Requests ({pendingUsers.length})
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Students who requested an account via the login board. You can review their notes and approve or reject them.
            </p>

            {pendingUsers.length === 0 ? (
              <div className="py-16 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-400/60 mx-auto mb-2" />
                <p className="text-xs text-slate-400">All student account requests have been reviewed!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{user.username}</span>
                        <span className="px-2 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                          Pending Approval
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        <strong>Reason:</strong> "{user.note || 'No note provided'}"
                      </p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Requested {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => approveAccount(user.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-xs font-bold transition-all active:scale-95"
                      >
                        Approve Account
                      </button>
                      <button
                        onClick={() => rejectAccount(user.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 text-xs font-semibold transition-all active:scale-95"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: USERS & PASSWORDS */}
      {adminTab === 'users' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="liquid-glass-surface rounded-3xl p-6 sm:p-7 border border-white/10">
            <h2 className="text-lg font-bold text-white font-display mb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              User Accounts & Passwords ({approvedUsers.length})
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              You can change student usernames or assign temporary passwords. Passwords are securely encrypted and masked.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 pl-2">Username</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Password Status</th>
                    <th className="pb-3 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {approvedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pl-2">
                        <span className="font-bold text-white">{u.username}</span>
                        {u.temporaryPasswordAssigned && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            Temp Password Active
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                              : 'bg-white/[0.05] text-slate-300'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 font-mono text-[11px]">
                        •••••••••••• (Encrypted)
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setEditUsername(u.username);
                              setEditTempPassword('');
                            }}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-medium border border-white/10 transition-all"
                          >
                            <KeyRound className="w-3 h-3 text-amber-400" />
                            <span>Edit / Temp Pass</span>
                          </button>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete account for "${u.username}"?`)) {
                                  adminDeleteUser(u.id);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-300 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit User Modal */}
          {editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="w-full max-w-md liquid-glass-surface rounded-3xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <h3 className="text-base font-bold text-white">
                    Edit Account: {editingUser.username}
                  </h3>
                  <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                {userEditFeedback && (
                  <div className="mb-4 p-2.5 rounded-xl bg-cyan-500/20 text-cyan-200 text-xs">
                    {userEditFeedback}
                  </div>
                )}

                <form onSubmit={handleSaveUserEdit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Username (Student cannot change on their own)
                    </label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Set New Temporary Password
                    </label>
                    <input
                      type="text"
                      placeholder="Leave blank to keep unchanged"
                      value={editTempPassword}
                      onChange={(e) => setEditTempPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-mono text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold text-xs"
                    >
                      Update Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: MAINTENANCE MODE */}
      {adminTab === 'maintenance' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="liquid-glass-surface rounded-3xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-lg font-bold text-white font-display mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Maintenance Mode & Countdown Timer
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              When enabled, regular students will see a maintenance screen with your custom message and optional live return countdown.
            </p>

            {maintFeedback && (
              <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{maintFeedback}</span>
              </div>
            )}

            <div className="space-y-6">
              {/* Toggle switch */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div>
                  <h4 className="text-sm font-bold text-white">Enable Maintenance Lock Screen</h4>
                  <p className="text-xs text-slate-400">
                    Only administrators can log in and view the app while this is active.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maintEnabled}
                    onChange={(e) => setMaintEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
                </label>
              </div>

              {/* Maintenance Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Message for Students
                </label>
                <textarea
                  rows={3}
                  value={maintMessage}
                  onChange={(e) => setMaintMessage(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Countdown Setting */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Estimated Finish Countdown Timer</h4>
                      <p className="text-[11px] text-slate-400">
                        Shows a live animated countdown clock on the maintenance page.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintHasCountdown}
                    onChange={(e) => setMaintHasCountdown(e.target.checked)}
                    className="rounded border-white/20 bg-slate-900 text-cyan-400 focus:ring-0"
                  />
                </div>

                {maintHasCountdown && (
                  <div className="space-y-3 pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Estimated Completion Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={maintFinishTime}
                        onChange={(e) => setMaintFinishTime(e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-slate-400 text-[11px]">Quick Buttons:</span>
                      <button
                        type="button"
                        onClick={() => setQuickMinutes(15)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/30 text-[11px]"
                      >
                        +15 Minutes
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickMinutes(30)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/30 text-[11px]"
                      >
                        +30 Minutes
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickMinutes(60)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/30 text-[11px]"
                      >
                        +1 Hour
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickMinutes(120)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/30 text-[11px]"
                      >
                        +2 Hours
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveMaintenance}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  Save Maintenance Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: BROADCAST POP-UPS */}
      {adminTab === 'popups' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="liquid-glass-surface rounded-3xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-lg font-bold text-white font-display mb-2 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-400" />
              Transmit Broadcast Pop-up Message
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Send instant pop-ups to all students or individual users.
            </p>

            {popupFeedback && (
              <div className="mb-6 p-3.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{popupFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSendPopup} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Recipient
                  </label>
                  <select
                    value={popupTarget}
                    onChange={(e) => setPopupTarget(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="all">Broadcast to All Users</option>
                    {approvedUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Notification Type
                  </label>
                  <select
                    value={popupType}
                    onChange={(e) => setPopupType(e.target.value as PopupType)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="alert">Important Alert</option>
                    <option value="music">Music Drop</option>
                    <option value="message">Direct Note</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Message Title *
                  </label>
                  <input
                    type="text"
                    value={popupTitle}
                    onChange={(e) => setPopupTitle(e.target.value)}
                    placeholder="e.g. YouTube Blocked Tomorrow - Use YouSong!"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Message Body *
                  </label>
                  <textarea
                    rows={3}
                    value={popupMessage}
                    onChange={(e) => setPopupMessage(e.target.value)}
                    placeholder="Enter your announcement..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  Transmit Broadcast
                </button>
              </div>
            </form>
          </div>

          {/* Active Broadcasts History */}
          <div className="liquid-glass-surface rounded-3xl p-6 sm:p-7 border border-white/10">
            <h3 className="text-base font-bold text-white font-display mb-4">
              Active Broadcasts History ({allPopups.length})
            </h3>
            {allPopups.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No broadcasts sent yet.</p>
            ) : (
              <div className="space-y-3">
                {allPopups.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{p.title}</h4>
                        <span className="text-[10px] px-2 py-0.2 rounded bg-white/[0.05] text-cyan-300 border border-white/10 uppercase">
                          {p.type}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Target: {p.targetUserId === 'all' ? 'All Users' : p.targetUserId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">"{p.message}"</p>
                    </div>

                    <button
                      onClick={() => deletePopup(p.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete Broadcast"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Song Modal */}
      {editingSong && (
        <EditSongModal
          song={editingSong}
          isOpen={!!editingSong}
          onClose={() => setEditingSong(null)}
          availableGenres={activeGenres}
        />
      )}
    </div>
  );
};
