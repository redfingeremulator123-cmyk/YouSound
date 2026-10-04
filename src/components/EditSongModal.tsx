import React, { useState, useEffect } from 'react';
import { Song } from '../types';
import { useAudio } from '../context/AudioContext';
import {
  X,
  Image as ImageIcon,
  Check,
  Upload,
  Link,
  Sparkles,
  Music2,
  Save,
  Tag,
  Play,
  Pause,
  Sliders,
  Volume2,
} from 'lucide-react';

interface EditSongModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  availableGenres?: string[];
}

const GALLERY_PRESETS = [
  {
    name: 'Lo-Fi Study Desk',
    url: '/src/assets/images/lofi_study_glass_1791054585559.jpg',
    tag: 'Lo-Fi',
  },
  {
    name: 'Synthwave Prism',
    url: '/src/assets/images/synthwave_prism_sound_1791054595636.jpg',
    tag: 'Synthwave',
  },
  {
    name: 'Chill Turquoise Wave',
    url: '/src/assets/images/chill_ambient_wave_1791054604455.jpg',
    tag: 'Ambient / Classical',
  },
  {
    name: 'Electric Sonic Burst',
    url: '/src/assets/images/electric_energy_liquid_1791054613304.jpg',
    tag: 'Electronic',
  },
];

export const EditSongModal: React.FC<EditSongModalProps> = ({
  song,
  isOpen,
  onClose,
  availableGenres = ['Classical', 'Lo-Fi', 'Synthwave', 'Ambient', 'Electronic', 'Acoustic', 'Jazz'],
}) => {
  const { updateSong } = useAudio();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [typeMood, setTypeMood] = useState('');
  const [album, setAlbum] = useState('');
  const [duration, setDuration] = useState(180);
  const [audioUrl, setAudioUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [description, setDescription] = useState('');

  const [coverMode, setCoverMode] = useState<'gallery' | 'url' | 'upload'>('gallery');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Quick audio preview player
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist);
      setGenre(song.genre);
      setTagsInput(song.tags ? song.tags.join(', ') : '');
      setTypeMood(song.typeMood || '');
      setAlbum(song.album || 'Single');
      setDuration(song.duration);
      setAudioUrl(song.audioUrl);
      setCoverUrl(song.coverUrl);
      setCustomUrlInput(song.coverUrl);
      setFeatured(!!song.featured);
      setDescription(song.description || '');
    }
    return () => {
      if (previewAudio) {
        previewAudio.pause();
      }
    };
  }, [song]);

  if (!isOpen || !song) return null;

  const togglePreview = () => {
    if (isPreviewPlaying && previewAudio) {
      previewAudio.pause();
      setIsPreviewPlaying(false);
    } else {
      if (previewAudio) {
        previewAudio.pause();
      }
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPreviewPlaying(false);
      audio.onerror = () => {
        setFeedback('Audio preview failed to load stream.');
        setIsPreviewPlaying(false);
      };
      audio.play().then(() => {
        setPreviewAudio(audio);
        setIsPreviewPlaying(true);
      }).catch((e) => {
        console.warn('Preview play error:', e);
        setFeedback('Could not play audio preview (browser policy or CORS).');
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      setCoverUrl(dataUri);
      setFeedback('Local image loaded successfully!');
      setTimeout(() => setFeedback(null), 2500);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setCoverUrl(customUrlInput.trim());
      setFeedback('Cover image URL updated!');
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) {
      setFeedback('Title and Artist cannot be empty.');
      return;
    }

    if (previewAudio) {
      previewAudio.pause();
    }

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    updateSong(song.id, {
      title: title.trim(),
      artist: artist.trim(),
      genre: genre.trim() || 'General',
      tags: parsedTags.length > 0 ? parsedTags : [genre.trim().toLowerCase()],
      typeMood: typeMood.trim() || undefined,
      album: album.trim() || 'Single',
      duration: Number(duration) || 180,
      audioUrl: audioUrl.trim(),
      coverUrl: coverUrl.trim(),
      featured,
      description: description.trim() || undefined,
    });

    setFeedback('Song updated successfully! Selection tabs refreshed.');
    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl liquid-glass-surface rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-md">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                Edit Song & Genre Metadata
              </h3>
              <p className="text-xs text-slate-400">
                Modify title, artist, genre, tags, type, or cover image. Genres not assigned to any song are automatically removed from library tabs.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (previewAudio) previewAudio.pause();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback && (
          <div className="mb-4 p-3 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-200 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Top Preview Card */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            {/* Live Cover Preview */}
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-slate-900 border border-white/20 shrink-0 shadow-lg">
              <img
                src={coverUrl}
                alt="Cover Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="w-full h-full absolute inset-0 -z-10 flex items-center justify-center bg-slate-900">
                <Music2 className="w-8 h-8 text-cyan-400/40" />
              </div>
            </div>

            {/* Song Live Info */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-300 font-mono">
                  Live Preview
                </span>
                {featured && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-medium border border-amber-400/30">
                    ★ Featured
                  </span>
                )}
              </div>
              <h4 className="text-base font-bold text-white truncate mt-0.5">
                {title || 'Untitled Song'}
              </h4>
              <p className="text-xs text-slate-400 truncate">{artist || 'Unknown Artist'}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-2 text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-200 border border-cyan-400/20 font-medium">
                  {genre || 'Genre'}
                </span>
                {typeMood && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-200 border border-indigo-400/20">
                    {typeMood}
                  </span>
                )}
                <span>·</span>
                <span className="font-mono tabular-nums">
                  {Math.floor(duration / 60)}:
                  {String(Math.floor(duration % 60)).padStart(2, '0')}
                </span>
              </div>

              {/* Quick Audio Test Button */}
              {audioUrl && (
                <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={togglePreview}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-200 text-xs font-semibold transition-all"
                  >
                    {isPreviewPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPreviewPlaying ? 'Pause Test' : 'Test Audio Playback'}</span>
                  </button>
                  <span className="text-[10px] text-slate-400">Verify audio stream works</span>
                </div>
              )}
            </div>
          </div>

          {/* Cover Image Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-display">
                Customize Cover Image
              </label>
              <div className="flex p-0.5 rounded-lg bg-white/[0.05] border border-white/10 text-[11px]">
                <button
                  type="button"
                  onClick={() => setCoverMode('gallery')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    coverMode === 'gallery'
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Gallery Presets
                </button>
                <button
                  type="button"
                  onClick={() => setCoverMode('url')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    coverMode === 'url'
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Image URL
                </button>
                <button
                  type="button"
                  onClick={() => setCoverMode('upload')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    coverMode === 'upload'
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            {/* Mode 1: Gallery */}
            {coverMode === 'gallery' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {GALLERY_PRESETS.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCoverUrl(item.url)}
                    className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all ${
                      coverUrl === item.url
                        ? 'border-cyan-400 ring-2 ring-cyan-400/40'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={item.url} alt={item.name} className="w-full h-20 object-cover" />
                    <div className="p-1.5 bg-slate-950/80 backdrop-blur-sm">
                      <div className="text-[10px] font-semibold text-white truncate">{item.name}</div>
                      <div className="text-[9px] text-cyan-300">{item.tag}</div>
                    </div>
                    {coverUrl === item.url && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Mode 2: Custom URL */}
            {coverMode === 'url' && (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    placeholder="https://example.com/cover-artwork.jpg"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-xs font-semibold text-cyan-200 transition-colors"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Mode 3: Local File Upload */}
            {coverMode === 'upload' && (
              <div className="p-4 rounded-xl border border-dashed border-white/20 text-center">
                <Upload className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <label className="cursor-pointer px-4 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-semibold inline-block transition-colors">
                  Select Image from Device
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, WebP supported</p>
              </div>
            )}
          </div>

          {/* Text Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Song Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Clair de Lune"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Artist / Composer *</label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. Claude Debussy"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Genre *</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Classical, Piano, Lo-Fi"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
              />
              {/* Quick Genre Suggestions */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['Classical', 'Piano', 'Lo-Fi', 'Synthwave', 'Ambient', 'Electronic', 'Acoustic', 'Jazz'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGenre(g)}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                      genre.toLowerCase() === g.toLowerCase()
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 font-semibold'
                        : 'bg-white/[0.03] text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Type / Mood / Vibe</label>
              <input
                type="text"
                value={typeMood}
                onChange={(e) => setTypeMood(e.target.value)}
                placeholder="e.g. Gentle Solo Piano, Chill Study"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['Solo Piano', 'Chill Beats', 'Ambient Drone', 'Instrumental', 'High Energy'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeMood(t)}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/[0.03] text-slate-400 border border-white/5 hover:text-white"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                Tags (comma separated, for search & mood matching)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. piano, classical, debussy, study, calm, quiet"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Album</label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="Single or Album Name"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Duration (Seconds)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Audio Stream MP3 URL</label>
              <input
                type="text"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://ia800504.us.archive.org/11/items/ClairDeLune_675/ClairDeLune.mp3"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-white/20 bg-slate-900 text-cyan-400 focus:ring-0"
                />
                <span className="font-semibold text-white">Feature in "Songs You Might Like" bar</span>
              </label>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                if (previewAudio) previewAudio.pause();
                onClose();
              }}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
