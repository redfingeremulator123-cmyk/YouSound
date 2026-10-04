import React from 'react';
import { Song } from '../types';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { Play, Pause, Heart, Plus, Music2 } from 'lucide-react';

interface SongCardProps {
  song: Song;
  onOpenPlaylistModal: (song: Song) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, onOpenPlaylistModal }) => {
  const { currentSong, isPlaying, playSong, togglePlay, userFavorites, toggleFavorite, allSongs } = useAudio();
  const { currentUser } = useAuth();

  const isCurrent = currentSong?.id === song.id;
  const isCurrentPlaying = isCurrent && isPlaying;
  const isFav = userFavorites.includes(song.id);

  const handleCardClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, allSongs);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative liquid-glass-card rounded-2xl p-3.5 border transition-all duration-300 cursor-pointer overflow-hidden ${
        isCurrent
          ? 'border-cyan-400/50 bg-cyan-950/20 shadow-[0_8px_30px_rgba(6,182,212,0.2)]'
          : 'border-white/10 hover:border-white/25'
      }`}
    >
      {/* Liquid Sheen Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 via-white/[0.04] to-fuchsia-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Album Artwork Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 border border-white/10 mb-3 shadow-md">
        <img
          src={song.coverUrl}
          alt={song.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Fallback Icon Container if image fails */}
        <div className="w-full h-full absolute inset-0 -z-10 flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
          <Music2 className="w-10 h-10 text-cyan-400/40" />
        </div>

        {/* Play / Playing Overlay */}
        <div
          className={`absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center transition-all duration-200 ${
            isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.6)] transform hover:scale-110 active:scale-95 transition-all"
            aria-label={isCurrentPlaying ? 'Pause' : 'Play'}
          >
            {isCurrentPlaying ? (
              <Pause className="w-5 h-5 fill-slate-950" />
            ) : (
              <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
            )}
          </button>
        </div>

        {/* Playing Animated Equalizer Badge */}
        {isCurrentPlaying && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-slate-950/70 backdrop-blur-md border border-cyan-400/30 flex items-center gap-1">
            <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-4 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}

        {/* Genre Tag */}
        <div className="absolute bottom-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 text-slate-300">
          {song.genre}
        </div>
      </div>

      {/* Title & Artist info */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className={`text-sm font-semibold truncate ${isCurrent ? 'text-cyan-300' : 'text-white'}`}>
            {song.title}
          </h3>
          <p className="text-xs text-slate-400 truncate mt-0.5">{song.artist}</p>
        </div>

        {/* Duration */}
        <span className="text-[11px] font-mono tabular-nums text-slate-500 shrink-0 mt-0.5">
          {formatDuration(song.duration)}
        </span>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
        <span className="text-[11px] text-slate-400 truncate">
          {song.album || 'Single'}
        </span>

        <div className="flex items-center gap-1">
          {/* Add to Playlist button */}
          {currentUser && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPlaylistModal(song);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/[0.05] transition-colors"
              title="Add to Playlist"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(song.id);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/[0.05] transition-colors"
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-rose-400 fill-rose-400' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
