import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { SongCard } from './SongCard';
import { Playlist, Song } from '../types';
import {
  ListMusic,
  Plus,
  Play,
  Trash2,
  Music,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface PlaylistsViewProps {
  onOpenPlaylistModal: (song: Song | null) => void;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({ onOpenPlaylistModal }) => {
  const { userPlaylists, allSongs, playSong, deletePlaylist, removeSongFromPlaylist } = useAudio();
  const { currentUser } = useAuth();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="py-20 text-center">
        <ListMusic className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white font-display">Sign In to Create Playlists</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Create custom study playlists, save your favorite chill beats, and organize your music.
        </p>
      </div>
    );
  }

  const selectedPlaylist = userPlaylists.find((p) => p.id === selectedPlaylistId);
  const playlistSongs = selectedPlaylist
    ? selectedPlaylist.songIds
        .map((id) => allSongs.find((s) => s.id === id))
        .filter((s): s is Song => !!s)
    : [];

  const handlePlayEntirePlaylist = () => {
    if (playlistSongs.length > 0) {
      playSong(playlistSongs[0], playlistSongs);
    }
  };

  return (
    <div className="animate-in fade-in pb-24">
      {selectedPlaylist ? (
        /* Single Playlist Detail View */
        <div>
          <button
            onClick={() => setSelectedPlaylistId(null)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Playlists
          </button>

          {/* Header Banner */}
          <div className="liquid-glass-surface rounded-3xl p-6 sm:p-8 border border-white/10 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-36 h-36 rounded-2xl overflow-hidden bg-slate-900 border border-white/15 shrink-0 shadow-xl">
              {selectedPlaylist.coverUrl ? (
                <img
                  src={selectedPlaylist.coverUrl}
                  alt={selectedPlaylist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-12 h-12 text-cyan-400" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-300 font-mono">
                Student Playlist
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1 mb-2">
                {selectedPlaylist.name}
              </h1>
              <p className="text-xs text-slate-400 max-w-lg mb-4">
                {selectedPlaylist.description || 'Custom curated music mix.'}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-3">
                <button
                  onClick={handlePlayEntirePlaylist}
                  disabled={playlistSongs.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  Play All ({playlistSongs.length})
                </button>

                <button
                  onClick={() => {
                    deletePlaylist(selectedPlaylist.id);
                    setSelectedPlaylistId(null);
                  }}
                  className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition-colors"
                  title="Delete Playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Songs in Playlist */}
          {playlistSongs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No songs added to this playlist yet. Browse the library and click the "+" icon on any song!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {playlistSongs.map((song) => (
                <div key={song.id} className="relative group">
                  <SongCard song={song} onOpenPlaylistModal={() => onOpenPlaylistModal(song)} />
                  <button
                    onClick={() => removeSongFromPlaylist(selectedPlaylist.id, song.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-slate-400 hover:text-rose-400 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    title="Remove from playlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Playlists Grid View */
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Your Playlists</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Curate music for different subjects and study moods.
              </p>
            </div>

            <button
              onClick={() => onOpenPlaylistModal(null)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              New Playlist
            </button>
          </div>

          {userPlaylists.length === 0 ? (
            <div className="py-16 text-center liquid-glass-surface rounded-3xl border border-white/10 p-8">
              <ListMusic className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white font-display">No Playlists Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-5">
                Get started by creating a playlist like "AP Chem Study" or "Chill Beats".
              </p>
              <button
                onClick={() => onOpenPlaylistModal(null)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
              >
                Create First Playlist
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylistId(pl.id)}
                  className="group liquid-glass-card rounded-2xl p-4 border border-white/10 hover:border-cyan-400/40 cursor-pointer flex flex-col justify-between transition-all"
                >
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                      {pl.coverUrl ? (
                        <img
                          src={pl.coverUrl}
                          alt={pl.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-6 h-6 text-cyan-400" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 truncate transition-colors">
                        {pl.name}
                      </h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {pl.songIds.length} {pl.songIds.length === 1 ? 'song' : 'songs'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                    <span className="truncate">{pl.description || 'Personal playlist'}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
