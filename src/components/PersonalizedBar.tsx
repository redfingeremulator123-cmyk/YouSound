import React, { useRef, useMemo } from 'react';
import { Song } from '../types';
import { useAudio } from '../context/AudioContext';
import { Sparkles, Play, Pause, Heart, ChevronLeft, ChevronRight, Music } from 'lucide-react';

interface PersonalizedBarProps {
  onOpenPlaylistModal?: (song: Song) => void;
}

export const PersonalizedBar: React.FC<PersonalizedBarProps> = ({ onOpenPlaylistModal }) => {
  const { allSongs, currentSong, isPlaying, playSong, togglePlay, userFavorites, toggleFavorite } = useAudio();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Compute personalized recommendations based on favorites and featured status
  const recommendedSongs = useMemo(() => {
    if (allSongs.length === 0) return [];

    // Check favorite genres
    const favSongs = allSongs.filter((s) => userFavorites.includes(s.id));
    const favGenres = favSongs.map((s) => s.genre);

    const scored = allSongs.map((song) => {
      let score = song.plays || 0;
      if (song.featured) score += 50;
      if (favGenres.includes(song.genre)) score += 40;
      return { song, score };
    });

    // Sort by score descending and take top 8
    scored.sort((a, b) => b.score - a.score);
    return scored.map((item) => item.song).slice(0, 8);
  }, [allSongs, userFavorites]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (recommendedSongs.length === 0) return null;

  return (
    <section className="relative w-full mb-8 pt-4">
      {/* Liquid background glow */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-fuchsia-500/10 blur-xl opacity-75 pointer-events-none" />

      <div className="relative liquid-glass-surface rounded-2xl p-4 sm:p-5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400/20 to-fuchsia-400/20 border border-cyan-400/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-display flex items-center gap-2">
                Songs You Might Like
                <span className="text-[11px] font-normal text-slate-400 hidden sm:inline">
                  · Personalized based on your study vibe
                </span>
              </h2>
            </div>
          </div>

          {/* Carousel navigation buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-all active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-all active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll cards */}
        <div
          ref={scrollRef}
          className="flex items-center gap-3.5 overflow-x-auto pb-2 scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {recommendedSongs.map((song, index) => {
            const isCurrent = currentSong?.id === song.id;
            const isCurrentPlaying = isCurrent && isPlaying;
            const isFav = userFavorites.includes(song.id);

            // Compute dynamic tag
            const recommendationReason =
              index === 0
                ? '⭐ Top School Favorite'
                : song.genre === 'Lo-Fi'
                ? '🎧 Best for Homework'
                : song.genre === 'Synthwave'
                ? '⚡ Energy Pulse'
                : song.genre === 'Ambient'
                ? '🌙 Deep Focus'
                : '✨ Recommended';

            return (
              <div
                key={`rec-${song.id}`}
                className="group relative flex-none w-64 sm:w-72 liquid-glass-card rounded-xl p-3 border border-white/10 hover:border-cyan-400/40 hover:shadow-[0_8px_25px_rgba(6,182,212,0.15)] transition-all cursor-pointer"
                onClick={() => {
                  if (isCurrent) {
                    togglePlay();
                  } else {
                    playSong(song, recommendedSongs);
                  }
                }}
              >
                <div className="flex gap-3 items-center">
                  {/* Artwork with play overlay */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-white/10">
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                        isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        {isCurrentPlaying ? (
                          <Pause className="w-4 h-4 fill-slate-950" />
                        ) : (
                          <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-medium text-cyan-300/90 mb-0.5 truncate">
                      {recommendationReason}
                    </div>
                    <h3 className={`text-xs font-semibold truncate ${isCurrent ? 'text-cyan-300' : 'text-white'}`}>
                      {song.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{song.artist}</p>

                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                      <span>{song.genre}</span>
                      <span>·</span>
                      <span>
                        {Math.floor(song.duration / 60)}:
                        {String(Math.floor(song.duration % 60)).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Heart / Action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(song.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors shrink-0"
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'text-rose-400 fill-rose-400' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
