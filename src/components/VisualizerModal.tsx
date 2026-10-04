import React, { useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Volume2,
  VolumeX,
  Heart,
  Music2,
  Sparkles,
} from 'lucide-react';

export const VisualizerModal: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    isExpandedVisualizer,
    setIsExpandedVisualizer,
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
  } = useAudio();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated Liquid Waves Canvas
  useEffect(() => {
    if (!isExpandedVisualizer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height * 0.7;

      step += isPlaying ? 0.03 : 0.008;

      // Draw 3 layers of smooth liquid waves
      const waveConfigs = [
        { amplitude: isPlaying ? 40 : 15, wavelength: 0.006, color: 'rgba(6, 182, 212, 0.25)', speed: 1.2 },
        { amplitude: isPlaying ? 55 : 20, wavelength: 0.004, color: 'rgba(99, 102, 241, 0.2)', speed: 0.8 },
        { amplitude: isPlaying ? 70 : 25, wavelength: 0.003, color: 'rgba(217, 70, 239, 0.15)', speed: 0.5 },
      ];

      waveConfigs.forEach((cfg) => {
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 4) {
          const y =
            centerY +
            Math.sin(x * cfg.wavelength + step * cfg.speed) * cfg.amplitude +
            Math.cos(x * cfg.wavelength * 0.5 + step) * (cfg.amplitude * 0.4);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = cfg.color;
        ctx.fill();
      });

      // Ambient floating particles
      for (let i = 0; i < 20; i++) {
        const px = ((i * 137.5 + step * 25) % width);
        const py = ((i * 219.7 + Math.sin(step + i) * 60 + height * 0.4) % height);
        ctx.beginPath();
        ctx.arc(px, py, (i % 3) + 1.5, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(6, 182, 212, 0.4)' : 'rgba(244, 114, 182, 0.4)';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isExpandedVisualizer, isPlaying]);

  if (!isExpandedVisualizer || !currentSong) return null;

  const isFav = userFavorites.includes(currentSong.id);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-[#04060e]/90 backdrop-blur-3xl animate-in fade-in duration-300">
      {/* Background Interactive Liquid Waves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Main Glass Visualizer Box */}
      <div className="relative z-10 w-full max-w-4xl liquid-glass-surface rounded-3xl p-6 sm:p-10 border border-white/20 shadow-[0_24px_80px_rgba(0,0,0,0.7)] flex flex-col items-center">
        {/* Top Header Row with Close */}
        <div className="w-full flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs uppercase tracking-widest text-cyan-300/80 font-mono">
              Liquid Crystal Stream Visualizer
            </span>
          </div>

          <button
            onClick={() => setIsExpandedVisualizer(false)}
            className="p-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white transition-all active:scale-95"
            title="Minimize"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Artwork with Liquid Glowing Ring */}
        <div className="relative my-4 sm:my-8">
          {/* Animated liquid glowing aura */}
          <div
            className={`absolute -inset-4 rounded-3xl bg-gradient-to-tr from-cyan-500/30 via-indigo-500/20 to-fuchsia-500/30 blur-2xl transition-all duration-700 ${
              isPlaying ? 'scale-110 opacity-100' : 'scale-95 opacity-50'
            }`}
          />

          <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900">
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
            />
            <div className="w-full h-full absolute inset-0 -z-10 flex items-center justify-center bg-slate-900">
              <Music2 className="w-16 h-16 text-cyan-400/40" />
            </div>
          </div>
        </div>

        {/* Song Info */}
        <div className="text-center max-w-lg mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display mb-1">
            {currentSong.title}
          </h2>
          <p className="text-sm text-cyan-300/90 font-medium">{currentSong.artist}</p>
          <p className="text-xs text-slate-400 mt-1">
            {currentSong.genre} · {currentSong.album || 'Single'}
          </p>
        </div>

        {/* Scrubber */}
        <div className="w-full max-w-xl flex items-center gap-3 mb-6">
          <span className="text-xs font-mono tabular-nums text-slate-400 w-10 text-right">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 flex items-center h-4 cursor-pointer">
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/25 animate-liquid-shimmer" />
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime || 0}
              onChange={(e) => seek(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <span className="text-xs font-mono tabular-nums text-slate-400 w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Main Controls Row */}
        <div className="flex items-center gap-4 sm:gap-6 mb-4">
          <button
            onClick={toggleShuffle}
            className={`p-3 rounded-2xl transition-all ${
              isShuffled ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={playPrevious}
            className="p-3 rounded-2xl text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all active:scale-95"
            title="Previous"
          >
            <SkipBack className="w-6 h-6 fill-slate-300" />
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-400 to-indigo-500 text-slate-950 flex items-center justify-center shadow-[0_0_32px_rgba(6,182,212,0.7)] hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-slate-950" />
            ) : (
              <Play className="w-7 h-7 fill-slate-950 ml-1" />
            )}
          </button>

          <button
            onClick={playNext}
            className="p-3 rounded-2xl text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all active:scale-95"
            title="Next"
          >
            <SkipForward className="w-6 h-6 fill-slate-300" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-3 rounded-2xl transition-all ${
              repeatMode !== 'off' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Bottom Favorite & Volume */}
        <div className="flex items-center gap-6 text-slate-400">
          <button
            onClick={() => toggleFavorite(currentSong.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/[0.05] transition-colors"
          >
            <Heart className={`w-5 h-5 ${isFav ? 'text-rose-400 fill-rose-400' : ''}`} />
            <span className="text-xs">{isFav ? 'Favorited' : 'Favorite'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="hover:text-white transition-colors">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolumeLevel(Number(e.target.value))}
              className="w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
