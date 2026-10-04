import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  Heart,
  Maximize2,
  List,
  Music2,
} from 'lucide-react';

export const PlayerBar: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    queue,
    togglePlay,
    seek,
    setVolumeLevel,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    playNext,
    playPrevious,
    toggleFavorite,
    userFavorites,
    setIsExpandedVisualizer,
    removeFromQueue,
    clearQueue,
    playSong,
  } = useAudio();
  const { currentUser } = useAuth();
  const [showQueue, setShowQueue] = useState(false);

  if (!currentSong) return null;

  const isFav = userFavorites.includes(currentSong.id);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Floating Liquid Glass Player Bar */}
      <div className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 z-40">
        <div className="max-w-6xl mx-auto liquid-glass-surface rounded-2xl p-3 sm:py-3.5 sm:px-5 border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
          {/* Top Scrubber Bar */}
          <div className="relative w-full flex items-center gap-2 mb-2 group">
            <span className="text-[11px] font-mono tabular-nums text-slate-400 w-8 text-right shrink-0">
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1 flex items-center h-4 cursor-pointer">
              {/* Progress Background */}
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden relative group-hover:h-2 transition-all">
                {/* Glowing Liquid Progress */}
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 rounded-full relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-liquid-shimmer" />
                </div>
              </div>

              {/* Range Input for Seek */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime || 0}
                onChange={(e) => seek(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Seek track position"
              />
            </div>

            <span className="text-[11px] font-mono tabular-nums text-slate-400 w-8 shrink-0">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-3">
            {/* Left: Track Information & Artwork */}
            <div className="flex items-center gap-3 min-w-0 max-w-[200px] sm:max-w-xs">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-slate-900 shadow-md">
                <img
                  src={currentSong.coverUrl}
                  alt={currentSong.title}
                  className={`w-full h-full object-cover ${isPlaying ? 'scale-105' : ''} transition-transform duration-500`}
                />
                <div className="w-full h-full absolute inset-0 -z-10 flex items-center justify-center bg-slate-900">
                  <Music2 className="w-6 h-6 text-cyan-400/40" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-semibold text-white truncate font-display">
                  {currentSong.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{currentSong.artist}</p>
              </div>

              {currentUser && (
                <button
                  onClick={() => toggleFavorite(currentSong.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors shrink-0"
                  title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'text-rose-400 fill-rose-400' : ''}`} />
                </button>
              )}
            </div>

            {/* Center: Playback Buttons */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-xl text-xs transition-colors hidden sm:block ${
                  isShuffled ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Prev */}
              <button
                onClick={playPrevious}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all active:scale-95"
                title="Previous track"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-300" />
              </button>

              {/* Play / Pause button */}
              <button
                onClick={togglePlay}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_26px_rgba(6,182,212,0.7)] hover:scale-105 active:scale-95 transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-slate-950" />
                ) : (
                  <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={playNext}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all active:scale-95"
                title="Next track"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-300" />
              </button>

              {/* Repeat */}
              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-xl text-xs transition-colors hidden sm:block ${
                  repeatMode !== 'off' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* Right: Soundwaves, Volume & Expand */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mini Liquid Soundwaves Equalizer */}
              <div className="hidden lg:flex items-center gap-1 h-5 px-2">
                {[0.4, 0.9, 0.6, 0.3, 0.8, 0.5, 1.0].map((h, i) => (
                  <span
                    key={i}
                    className={`w-0.5 rounded-full bg-gradient-to-t from-cyan-400 to-indigo-300 transition-all ${
                      isPlaying ? 'animate-pulse' : 'h-1.5 opacity-30'
                    }`}
                    style={{
                      height: isPlaying ? `${Math.max(4, h * 18)}px` : '4px',
                      animationDelay: `${i * 120}ms`,
                      animationDuration: '600ms',
                    }}
                  />
                ))}
              </div>

              {/* Volume Slider */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-slate-400 hover:text-white transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolumeLevel(Number(e.target.value))}
                  className="w-16 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  aria-label="Volume slider"
                />
              </div>

              {/* Queue Button */}
              <button
                onClick={() => setShowQueue(!showQueue)}
                className={`p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors relative ${
                  showQueue ? 'bg-cyan-500/20 text-cyan-300' : ''
                }`}
                title="Play Queue"
              >
                <List className="w-4 h-4" />
                {queue.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {queue.length}
                  </span>
                )}
              </button>

              {/* Fullscreen Visualizer Modal Button */}
              <button
                onClick={() => setIsExpandedVisualizer(true)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                title="Full Visualizer Mode"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Queue Drawer */}
      {showQueue && (
        <div className="fixed bottom-24 right-4 sm:right-8 z-40 w-80 max-w-[90vw] liquid-glass-surface rounded-2xl p-4 border border-white/20 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider font-display">
              Playing Queue ({queue.length})
            </h5>
            {queue.length > 0 && (
              <button
                onClick={clearQueue}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {queue.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Queue is empty. Click songs to add them to your queue!
            </p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {queue.map((song, i) => (
                <div
                  key={`queue-${song.id}-${i}`}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-colors group cursor-pointer"
                  onClick={() => playSong(song)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white truncate">{song.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{song.artist}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(song.id);
                    }}
                    className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove from queue"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
