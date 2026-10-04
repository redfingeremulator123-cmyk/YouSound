import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { Song } from '../types';
import {
  Upload,
  Link as LinkIcon,
  Play,
  CheckCircle,
  Plus,
  Shield,
  FileAudio,
  Image as ImageIcon,
  Check,
  Sparkles,
  Music2,
  Trash2,
} from 'lucide-react';

interface ManualSongUploaderProps {
  onOpenAuth: () => void;
  onEditSong?: (song: Song) => void;
}

const COVER_PRESETS = [
  { name: 'Turquoise Ripples', url: '/src/assets/images/chill_ambient_wave_1791054604455.jpg' },
  { name: 'Study Desk Glass', url: '/src/assets/images/lofi_study_glass_1791054585559.jpg' },
  { name: 'Synthwave Prism', url: '/src/assets/images/synthwave_prism_sound_1791054595636.jpg' },
  { name: 'Electric Pulse', url: '/src/assets/images/electric_energy_liquid_1791054613304.jpg' },
];

export const ManualSongUploader: React.FC<ManualSongUploaderProps> = ({ onOpenAuth, onEditSong }) => {
  const { isAdmin, login } = useAuth();
  const { addNewSong, playSong, allSongs, clearAllSongs } = useAudio();

  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('Lo-Fi');
  const [tags, setTags] = useState('study, chill');
  const [album, setAlbum] = useState('Single');
  const [duration, setDuration] = useState(210);
  const [audioUrl, setAudioUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState(COVER_PRESETS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [coverType, setCoverType] = useState<'preset' | 'url' | 'file'>('preset');

  const [isDragging, setIsDragging] = useState(false);
  const [recentSong, setRecentSong] = useState<Song | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  // Quick 1-click admin login
  const handleQuickAdminLogin = async () => {
    const res = await login('admin', 'admin123');
    if (res.success) {
      setFeedback('Unlocked LiamDev12027 Admin controls!');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // Process MP3 / Audio file
  const processAudioFile = (file: File) => {
    if (!file) return;

    // Auto-detect title from filename
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    setTitle(cleanTitle);
    if (!artist) setArtist('Uploaded Track');

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      setAudioUrl(dataUri);

      // Try reading duration
      const audio = new Audio();
      audio.src = dataUri;
      audio.onloadedmetadata = () => {
        if (audio.duration && isFinite(audio.duration)) {
          setDuration(Math.round(audio.duration));
        }
      };

      setFeedback(`Loaded audio file: "${file.name}"! Fill details and click Publish below.`);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAudioFile(e.dataTransfer.files[0]);
    }
  };

  // Custom cover upload
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverUrl(event.target?.result as string);
      setFeedback('Custom cover image loaded!');
    };
    reader.readAsDataURL(file);
  };

  // Submit song
  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      login('admin', 'admin123');
    }

    if (!title.trim() || !artist.trim() || !audioUrl.trim()) {
      setFeedback('Please provide a Song Title, Artist, and load an audio file or URL.');
      return;
    }

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const published = addNewSong({
      title: title.trim(),
      artist: artist.trim(),
      genre: genre.trim() || 'General',
      tags: parsedTags.length > 0 ? parsedTags : [genre.trim().toLowerCase()],
      album: album.trim() || 'Single',
      duration: Number(duration) || 180,
      audioUrl: audioUrl.trim(),
      coverUrl: coverUrl.trim() || COVER_PRESETS[0].url,
      featured: true,
    });

    setRecentSong(published);
    setFeedback(`Published "${published.title}" by ${published.artist} (${published.genre})!`);
    setTitle('');
    setArtist('');
    setAudioUrl('');
  };

  return (
    <div className="relative liquid-glass-surface rounded-3xl p-5 sm:p-7 border border-white/10 shadow-[0_12px_45px_rgba(0,0,0,0.3)] overflow-hidden">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-slate-950 shadow-md">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white font-display">
              Manual Song Upload Studio
            </h2>
            <p className="text-xs text-slate-300">
              Upload your own MP3 files directly or add streaming audio URLs. Full control over title, artist, genre, and artwork.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isAdmin ? (
            <button
              onClick={handleQuickAdminLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/30 text-amber-300 text-xs font-semibold transition-all active:scale-95"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Unlock Admin Mode (LiamDev12027)</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Admin Active
              </span>
              {allSongs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all songs from your library?')) {
                      clearAllSongs();
                      setFeedback('All songs have been cleared from library.');
                    }
                  }}
                  className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs border border-white/10 transition-colors"
                  title="Clear all songs from library"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div className="mb-4 p-3 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-cyan-400 hover:text-white underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Modes */}
      <div className="flex p-1 rounded-xl bg-white/[0.04] border border-white/10 mb-4 w-fit text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('file')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'file'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileAudio className="w-3.5 h-3.5" />
          <span>Upload MP3 File</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'url'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Add from Audio URL</span>
        </button>
      </div>

      <form onSubmit={handlePublish} className="space-y-4">
        {/* Tab 1: Drag & Drop File */}
        {activeTab === 'file' && (
          <div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-500/10'
                  : audioUrl && !audioUrl.startsWith('http')
                  ? 'border-emerald-400/50 bg-emerald-500/5'
                  : 'border-white/15 bg-white/[0.02] hover:border-cyan-400/40 hover:bg-white/[0.04]'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="audio/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    processAudioFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              {audioUrl && !audioUrl.startsWith('http') ? (
                <div className="space-y-1">
                  <span className="text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Audio File Loaded & Ready!
                  </span>
                  <p className="text-[11px] text-slate-400">Click to choose a different MP3 file</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">
                    Drag and drop your MP3 / Audio file here, or click to browse
                  </h4>
                  <p className="text-[11px] text-slate-400">MP3, WAV, M4A, OGG supported</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Direct Audio URL */}
        {activeTab === 'url' && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Audio Stream MP3 URL *
            </label>
            <input
              type="url"
              placeholder="https://example.com/song.mp3 or cloud storage link"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
              required
            />
          </div>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Song Title *</label>
            <input
              type="text"
              placeholder="e.g. My Favorite Study Song"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Artist / Composer *</label>
            <input
              type="text"
              placeholder="e.g. Artist Name"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Genre *</label>
            <input
              type="text"
              placeholder="e.g. Piano, Classical, Lo-Fi, Rock"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (Comma separated)</label>
            <input
              type="text"
              placeholder="e.g. study, calm, favorite"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Album (Optional)</label>
            <input
              type="text"
              placeholder="Single or Album Name"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Seconds)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Cover Image Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Album Cover Artwork
          </label>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => setCoverType('preset')}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                coverType === 'preset' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' : 'text-slate-400 border-white/10'
              }`}
            >
              Glass Presets
            </button>
            <button
              type="button"
              onClick={() => setCoverType('url')}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                coverType === 'url' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' : 'text-slate-400 border-white/10'
              }`}
            >
              Image URL
            </button>
            <button
              type="button"
              onClick={() => {
                setCoverType('file');
                coverInputRef.current?.click();
              }}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                coverType === 'file' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' : 'text-slate-400 border-white/10'
              }`}
            >
              Upload Image
            </button>
            <input
              type="file"
              ref={coverInputRef}
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
          </div>

          {coverType === 'preset' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COVER_PRESETS.map((item) => (
                <div
                  key={item.url}
                  onClick={() => setCoverUrl(item.url)}
                  className={`p-1 rounded-xl border cursor-pointer transition-all ${
                    coverUrl === item.url ? 'border-cyan-400 ring-2 ring-cyan-400/30' : 'border-white/10 hover:border-white/20'
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

          {coverType === 'url' && (
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://... image URL"
                value={customCoverUrl}
                onChange={(e) => setCustomCoverUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => {
                  if (customCoverUrl.trim()) setCoverUrl(customCoverUrl.trim());
                }}
                className="px-3 py-1.5 rounded-xl bg-white/[0.08] text-xs text-cyan-200"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Added tracks instantly show in the library and update genre tabs.
          </span>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Publish to YouSong Library</span>
          </button>
        </div>
      </form>

      {/* Success Notification */}
      {recentSong && (
        <div className="mt-4 p-3.5 rounded-2xl liquid-glass-surface bg-emerald-950/30 border border-emerald-400/30 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <img src={recentSong.coverUrl} alt={recentSong.title} className="w-10 h-10 rounded-xl object-cover" />
            <div>
              <h4 className="text-xs font-bold text-white">{recentSong.title}</h4>
              <p className="text-[11px] text-slate-300">by {recentSong.artist} · Added to library!</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => playSong(recentSong)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>Play Now</span>
            </button>
            {onEditSong && (
              <button
                onClick={() => onEditSong(recentSong)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.08] text-white text-xs font-medium border border-white/10"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
