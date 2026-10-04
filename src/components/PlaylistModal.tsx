import React, { useState } from 'react';
import { Song, Playlist } from '../types';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { X, Plus, Check, ListMusic, Music } from 'lucide-react';

interface PlaylistModalProps {
  songToAdd: Song | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({ songToAdd, isOpen, onClose }) => {
  const { userPlaylists, createPlaylist, addSongToPlaylist, removeSongFromPlaylist } = useAudio();
  const { currentUser } = useAuth();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const pl = createPlaylist(newPlaylistName.trim(), newPlaylistDesc.trim());
    if (songToAdd) {
      addSongToPlaylist(pl.id, songToAdd.id);
    }
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setIsCreating(false);
  };

  const toggleSongInPlaylist = (playlist: Playlist) => {
    if (!songToAdd) return;
    if (playlist.songIds.includes(songToAdd.id)) {
      removeSongFromPlaylist(playlist.id, songToAdd.id);
    } else {
      addSongToPlaylist(playlist.id, songToAdd.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md liquid-glass-surface rounded-3xl p-6 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
              <ListMusic className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                {songToAdd ? 'Add to Playlist' : 'Your Playlists'}
              </h3>
              {songToAdd && (
                <p className="text-xs text-slate-400 truncate max-w-[240px]">
                  Adding "{songToAdd.title}"
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Playlists List */}
        <div className="my-4 max-h-56 overflow-y-auto space-y-2 pr-1">
          {userPlaylists.length === 0 && !isCreating ? (
            <div className="py-6 text-center text-xs text-slate-400">
              You haven't created any playlists yet. Click below to create your first study playlist!
            </div>
          ) : (
            userPlaylists.map((pl) => {
              const containsSong = songToAdd ? pl.songIds.includes(songToAdd.id) : false;
              return (
                <div
                  key={pl.id}
                  onClick={() => songToAdd && toggleSongInPlaylist(pl)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    songToAdd ? 'cursor-pointer' : ''
                  } ${
                    containsSong
                      ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-200'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-800 border border-white/10 flex items-center justify-center">
                      {pl.coverUrl ? (
                        <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{pl.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {pl.songIds.length} {pl.songIds.length === 1 ? 'song' : 'songs'}
                        {pl.description ? ` · ${pl.description}` : ''}
                      </div>
                    </div>
                  </div>

                  {songToAdd && (
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        containsSong
                          ? 'bg-cyan-400 border-cyan-300 text-slate-950'
                          : 'border-white/30 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Create New Playlist Section */}
        {isCreating ? (
          <form onSubmit={handleCreate} className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
            <h4 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider font-display">
              New Playlist Details
            </h4>
            <input
              type="text"
              placeholder="Playlist Name (e.g. AP Chem Study Jam)"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              autoFocus
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newPlaylistDesc}
              onChange={(e) => setNewPlaylistDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-medium rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-md transition-colors"
              >
                Create Playlist
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-xs font-medium text-cyan-300 flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create New Playlist
          </button>
        )}
      </div>
    </div>
  );
};
