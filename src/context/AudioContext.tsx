import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Song, Playlist, RepeatMode } from '../types';
import { storage } from '../services/storage';
import { generateToneWavUrl } from '../utils/audioGenerator';
import { useAuth } from './AuthContext';

interface AudioContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  queue: Song[];
  allSongs: Song[];
  userFavorites: string[];
  userPlaylists: Playlist[];
  isExpandedVisualizer: boolean;
  // Controls
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolumeLevel: (vol: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  playNext: () => void;
  playPrevious: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;
  toggleFavorite: (songId: string) => void;
  createPlaylist: (name: string, description?: string) => Playlist;
  addSongToPlaylist: (playlistId: string, songId: string) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  setIsExpandedVisualizer: (val: boolean) => void;
  // Admin song management
  addNewSong: (song: Omit<Song, 'id' | 'addedAt' | 'plays'>) => Song;
  updateSong: (id: string, updates: Partial<Song>) => void;
  deleteSong: (id: string) => void;
  clearAllSongs: () => void;
  refreshSongLibrary: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [allSongs, setAllSongs] = useState<Song[]>(() => storage.getSongs());
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [isExpandedVisualizer, setIsExpandedVisualizer] = useState<boolean>(false);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      handleTrackEnd();
    };

    const handleError = () => {
      console.warn('Audio playback error for URL, activating safe procedural backup fallback');
      // If audio URL fails (e.g. school proxy or network blip), fallback smoothly to synthesized audio
      if (currentSong && !audio.src.startsWith('data:audio/wav')) {
        const toneType = currentSong.genre.toLowerCase().includes('lo-fi')
          ? 'lofi'
          : currentSong.genre.toLowerCase().includes('synth')
          ? 'synthwave'
          : currentSong.genre.toLowerCase().includes('ambient')
          ? 'ambient'
          : 'chill';
        const fallbackDataUri = generateToneWavUrl(440, 20, toneType as any);
        audio.src = fallbackDataUri;
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Sync user data
  useEffect(() => {
    if (currentUser) {
      setUserFavorites(storage.getUserFavorites(currentUser.id));
      setUserPlaylists(storage.getUserPlaylists(currentUser.id));
    } else {
      setUserFavorites([]);
      setUserPlaylists([]);
    }
  }, [currentUser]);

  const refreshSongLibrary = useCallback(() => {
    setAllSongs(storage.getSongs());
  }, []);

  const handleTrackEnd = useCallback(() => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }

    if (queue.length > 0) {
      const nextSong = queue[0];
      setQueue((prev) => prev.slice(1));
      playSong(nextSong);
    } else if (repeatMode === 'all' && allSongs.length > 0) {
      // Loop through all songs
      if (!currentSong) return;
      const currentIndex = allSongs.findIndex((s) => s.id === currentSong.id);
      let nextIndex = (currentIndex + 1) % allSongs.length;
      if (isShuffled) {
        nextIndex = Math.floor(Math.random() * allSongs.length);
      }
      playSong(allSongs[nextIndex]);
    } else {
      setIsPlaying(false);
    }
  }, [repeatMode, queue, allSongs, currentSong, isShuffled]);

  const playSong = useCallback((song: Song, newQueue?: Song[]) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    setCurrentSong(song);
    audio.src = song.audioUrl;
    audio.currentTime = 0;
    setDuration(song.duration || 180);

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        storage.incrementSongPlay(song.id);
      })
      .catch((err) => {
        console.warn('Playback play request was interrupted or blocked, trying fallback', err);
        // Automatic fallback to generated WAV tone
        const tone = generateToneWavUrl(440, 16, 'lofi');
        audio.src = tone;
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      });

    if (newQueue) {
      setQueue(newQueue.filter((s) => s.id !== song.id));
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (!currentSong && allSongs.length > 0) {
      playSong(allSongs[0]);
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.warn('Could not resume audio:', e));
    }
  }, [isPlaying, currentSong, allSongs, playSong]);

  const seek = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const setVolumeLevel = useCallback((vol: number) => {
    if (!audioRef.current) return;
    const clamped = Math.max(0, Math.min(1, vol));
    audioRef.current.volume = clamped;
    setVolume(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
      audioRef.current.muted = false;
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    audioRef.current.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => !prev);
  }, []);

  const playNext = useCallback(() => {
    handleTrackEnd();
  }, [handleTrackEnd]);

  const playPrevious = useCallback(() => {
    if (!audioRef.current || !currentSong) return;
    // If playback > 3s, rewind to start of current song
    if (audioRef.current.currentTime > 3) {
      seek(0);
      return;
    }
    const currentIndex = allSongs.findIndex((s) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + allSongs.length) % allSongs.length;
    playSong(allSongs[prevIndex]);
  }, [currentSong, allSongs, playSong, seek]);

  const addToQueue = useCallback((song: Song) => {
    setQueue((prev) => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback((songId: string) => {
    setQueue((prev) => prev.filter((s) => s.id !== songId));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const toggleFavorite = useCallback((songId: string) => {
    if (!currentUser) return;
    storage.toggleFavorite(currentUser.id, songId);
    setUserFavorites(storage.getUserFavorites(currentUser.id));
  }, [currentUser]);

  const createPlaylist = useCallback((name: string, description?: string) => {
    if (!currentUser) throw new Error('Must be logged in');
    const pl = storage.createPlaylist(currentUser.id, name, description);
    setUserPlaylists(storage.getUserPlaylists(currentUser.id));
    return pl;
  }, [currentUser]);

  const addSongToPlaylist = useCallback((playlistId: string, songId: string) => {
    storage.addSongToPlaylist(playlistId, songId);
    if (currentUser) {
      setUserPlaylists(storage.getUserPlaylists(currentUser.id));
    }
  }, [currentUser]);

  const removeSongFromPlaylist = useCallback((playlistId: string, songId: string) => {
    storage.removeSongFromPlaylist(playlistId, songId);
    if (currentUser) {
      setUserPlaylists(storage.getUserPlaylists(currentUser.id));
    }
  }, [currentUser]);

  const deletePlaylist = useCallback((playlistId: string) => {
    storage.deletePlaylist(playlistId);
    if (currentUser) {
      setUserPlaylists(storage.getUserPlaylists(currentUser.id));
    }
  }, [currentUser]);

  // Admin controls
  const addNewSong = useCallback((songData: Omit<Song, 'id' | 'addedAt' | 'plays'>) => {
    const s = storage.addSong(songData);
    refreshSongLibrary();
    return s;
  }, [refreshSongLibrary]);

  const updateSong = useCallback((id: string, updates: Partial<Song>) => {
    storage.updateSong(id, updates);
    refreshSongLibrary();
  }, [refreshSongLibrary]);

  const deleteSong = useCallback((id: string) => {
    storage.deleteSong(id);
    refreshSongLibrary();
    if (currentSong?.id === id) {
      playNext();
    }
  }, [refreshSongLibrary, currentSong, playNext]);

  const clearAllSongs = useCallback(() => {
    storage.clearAllSongs();
    refreshSongLibrary();
    if (isPlaying) {
      togglePlay();
    }
  }, [refreshSongLibrary, isPlaying, togglePlay]);

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        repeatMode,
        isShuffled,
        queue,
        allSongs,
        userFavorites,
        userPlaylists,
        isExpandedVisualizer,
        playSong,
        togglePlay,
        seek,
        setVolumeLevel,
        toggleMute,
        toggleRepeat,
        toggleShuffle,
        playNext,
        playPrevious,
        addToQueue,
        removeFromQueue,
        clearQueue,
        toggleFavorite,
        createPlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        deletePlaylist,
        setIsExpandedVisualizer,
        addNewSong,
        updateSong,
        deleteSong,
        clearAllSongs,
        refreshSongLibrary,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
