import React from 'react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { SongCard } from './SongCard';
import { Song } from '../types';
import { Heart, Play, Music } from 'lucide-react';

interface FavoritesViewProps {
  onOpenPlaylistModal: (song: Song | null) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ onOpenPlaylistModal }) => {
  const { allSongs, userFavorites, playSong } = useAudio();
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="py-20 text-center">
        <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white font-display">Sign In to Save Favorites</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Save your top study tracks and build your private music rotation.
        </p>
      </div>
    );
  }

  const favoriteSongs = allSongs.filter((s) => userFavorites.includes(s.id));

  const handlePlayAll = () => {
    if (favoriteSongs.length > 0) {
      playSong(favoriteSongs[0], favoriteSongs);
    }
  };

  return (
    <div className="animate-in fade-in pb-24">
      {/* Banner */}
      <div className="liquid-glass-surface rounded-3xl p-6 sm:p-8 border border-white/10 mb-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500/30 to-pink-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 shadow-lg shadow-rose-500/20">
            <Heart className="w-8 h-8 fill-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-display">Favorite Songs</h1>
            <p className="text-xs text-slate-400 mt-1">
              Your handpicked library collection ({favoriteSongs.length} tracks).
            </p>
          </div>
        </div>

        {favoriteSongs.length > 0 && (
          <button
            onClick={handlePlayAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            Play All Favorites
          </button>
        )}
      </div>

      {favoriteSongs.length === 0 ? (
        <div className="py-16 text-center liquid-glass-surface rounded-3xl border border-white/10 p-8">
          <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white font-display">No Favorites Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Click the heart icon on any song in the library to add it to your favorites.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoriteSongs.map((song) => (
            <SongCard key={song.id} song={song} onOpenPlaylistModal={onOpenPlaylistModal} />
          ))}
        </div>
      )}
    </div>
  );
};
