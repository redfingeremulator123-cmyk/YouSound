import React, { useState, useMemo, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AudioProvider, useAudio } from './context/AudioContext';
import { Header } from './components/Header';
import { PersonalizedBar } from './components/PersonalizedBar';
import { SongCard } from './components/SongCard';
import { PlayerBar } from './components/PlayerBar';
import { VisualizerModal } from './components/VisualizerModal';
import { PlaylistModal } from './components/PlaylistModal';
import { AuthModal } from './components/AuthModal';
import { AccountSettingsModal } from './components/AccountSettingsModal';
import { SongRequestModal } from './components/SongRequestModal';
import { ManualSongUploader } from './components/ManualSongUploader';
import { EditSongModal } from './components/EditSongModal';
import { AdminPanel } from './components/AdminPanel';
import { PlaylistsView } from './components/PlaylistsView';
import { FavoritesView } from './components/FavoritesView';
import { PopupDisplay } from './components/PopupDisplay';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { Song } from './types';
import { Music, Radio, Filter, Flame, Info, ListPlus } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { maintenanceState, isAdmin, bannerConfig } = useAuth();
  const { allSongs } = useAudio();

  const [activeTab, setActiveTab] = useState<'library' | 'playlists' | 'favorites' | 'admin'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSongRequestOpen, setIsSongRequestOpen] = useState(false);
  const [uploaderEditSong, setUploaderEditSong] = useState<Song | null>(null);
  const [playlistSongTarget, setPlaylistSongTarget] = useState<Song | null>(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  // Dynamic Genres: only genres that are currently assigned to songs in the library
  const dynamicGenres = useMemo(() => {
    const genreSet = new Set<string>();
    allSongs.forEach((song) => {
      if (song.genre && song.genre.trim()) {
        genreSet.add(song.genre.trim());
      }
    });
    const sorted = Array.from(genreSet).sort();
    return ['All', ...sorted];
  }, [allSongs]);

  // If the currently selected genre no longer exists in any song, reset to 'All'
  useEffect(() => {
    if (selectedGenre !== 'All' && !dynamicGenres.includes(selectedGenre)) {
      setSelectedGenre('All');
    }
  }, [dynamicGenres, selectedGenre]);

  // If maintenance mode is active AND user is not admin, show maintenance screen
  if (maintenanceState.enabled && !isAdmin) {
    return (
      <>
        <MaintenanceScreen onOpenAdminAuth={() => setIsAuthOpen(true)} />
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </>
    );
  }

  // Filter songs by title, artist, genre, or tags
  const filteredSongs = useMemo(() => {
    return allSongs.filter((song) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        song.title.toLowerCase().includes(q) ||
        song.artist.toLowerCase().includes(q) ||
        song.genre.toLowerCase().includes(q) ||
        (song.tags && song.tags.some((t) => t.toLowerCase().includes(q))) ||
        (song.typeMood && song.typeMood.toLowerCase().includes(q));

      const matchesGenre =
        selectedGenre === 'All' || song.genre.toLowerCase() === selectedGenre.toLowerCase();

      return matchesSearch && matchesGenre;
    });
  }, [allSongs, searchQuery, selectedGenre]);

  const handleOpenPlaylistModal = (song: Song | null) => {
    setPlaylistSongTarget(song);
    setIsPlaylistModalOpen(true);
  };

  return (
    <div className="min-h-screen relative bg-[#060814] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Morphing Liquid Ambient Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-cyan-600/15 rounded-full blur-[120px] animate-orb-1" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] animate-orb-2" />
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[130px] animate-orb-3" />
      </div>

      {/* Top Bar with Version & Navigation */}
      <div className="relative z-30">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
          onOpenSongRequest={() => setIsSongRequestOpen(true)}
        />
      </div>

      {/* Main View Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'library' && (
          <div className="space-y-6 pb-28">
            {/* Top School Ban Notice Ribbon */}
            {bannerConfig.ribbonEnabled && (
              <div className="liquid-glass-surface rounded-2xl p-3.5 sm:px-5 border border-cyan-400/20 shadow-sm flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                  <span className="text-slate-300">
                    <strong className="text-cyan-300 font-semibold">YouSong School Stream:</strong>{' '}
                    {bannerConfig.ribbonNotice ||
                      'All MP3 audio streams are pre-approved and work without YouTube access · Crafted by LiamDev12027.'}
                  </span>
                </div>
                <button
                  onClick={() => setIsSongRequestOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-200 text-xs font-semibold shrink-0 transition-colors"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>Request Song</span>
                </button>
              </div>
            )}

            {/* Manual Song Upload Studio */}
            <ManualSongUploader
              onOpenAuth={() => setIsAuthOpen(true)}
              onEditSong={(song) => setUploaderEditSong(song)}
            />

            {/* Personalized Bar: "Songs You Might Like" */}
            <PersonalizedBar onOpenPlaylistModal={handleOpenPlaylistModal} />

            {/* Genre Filter Bar & Counter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10 w-fit overflow-x-auto max-w-full">
                {dynamicGenres.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                      selectedGenre.toLowerCase() === g.toLowerCase()
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-3">
                <span>
                  Showing <span className="text-white font-semibold">{filteredSongs.length}</span> {filteredSongs.length === 1 ? 'track' : 'tracks'}
                </span>
                <button
                  onClick={() => setIsSongRequestOpen(true)}
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <ListPlus className="w-3 h-3" />
                  <span>Request a song</span>
                </button>
              </div>
            </div>

            {/* Songs Grid */}
            {filteredSongs.length === 0 ? (
              <div className="py-16 text-center liquid-glass-surface rounded-3xl border border-white/10 p-8 space-y-3">
                <Music className="w-12 h-12 text-slate-600 mx-auto" />
                {allSongs.length === 0 ? (
                  <>
                    <h3 className="text-base font-bold text-white font-display">
                      Your Music Library is Empty
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      All songs were cleared for your manual uploads. Use the Manual Song Upload Studio above to upload your MP3 files or add audio stream URLs!
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-base font-bold text-white font-display">No Songs Matched Your Search</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Try searching with different terms, or request LiamDev12027 to add this track!
                    </p>
                  </>
                )}
                <div className="pt-2">
                  <button
                    onClick={() => setIsSongRequestOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-200 text-xs font-bold transition-all shadow-md"
                  >
                    <ListPlus className="w-4 h-4" />
                    <span>Submit Song Request to LiamDev12027</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredSongs.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    onOpenPlaylistModal={handleOpenPlaylistModal}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Playlists */}
        {activeTab === 'playlists' && (
          <PlaylistsView onOpenPlaylistModal={handleOpenPlaylistModal} />
        )}

        {/* Tab 3: Favorites */}
        {activeTab === 'favorites' && (
          <FavoritesView onOpenPlaylistModal={handleOpenPlaylistModal} />
        )}

        {/* Tab 4: Admin Panel */}
        {activeTab === 'admin' && isAdmin && <AdminPanel />}
      </main>

      {/* Floating Liquid Glass Bottom Player */}
      <PlayerBar />

      {/* Full Screen Visualizer Modal */}
      <VisualizerModal />

      {/* Add To Playlist Modal */}
      <PlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        songToAdd={playlistSongTarget}
      />

      {/* Auth / Account Request Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Account Settings & Password Modal */}
      <AccountSettingsModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />

      {/* User Song Request Modal */}
      <SongRequestModal
        isOpen={isSongRequestOpen}
        onClose={() => setIsSongRequestOpen(false)}
      />

      {/* Edit Song Modal from Uploader */}
      {uploaderEditSong && (
        <EditSongModal
          song={uploaderEditSong}
          isOpen={!!uploaderEditSong}
          onClose={() => setUploaderEditSong(null)}
          availableGenres={dynamicGenres}
        />
      )}

      {/* Broadcast Popups Display */}
      <PopupDisplay />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <MainAppContent />
      </AudioProvider>
    </AuthProvider>
  );
}
