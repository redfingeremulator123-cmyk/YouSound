import {
  User,
  Song,
  Playlist,
  PopupMessage,
  MaintenanceState,
  BannerConfig,
  SongRequest,
} from '../types';
import {
  INITIAL_SONGS,
  INITIAL_USERS,
  INITIAL_POPUPS,
  INITIAL_MAINTENANCE,
  INITIAL_PLAYLISTS,
  INITIAL_BANNER,
  INITIAL_REQUESTS,
} from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'yousong_users',
  PASSWORDS: 'yousong_passwords_vault',
  SONGS: 'yousong_songs',
  PLAYLISTS: 'yousong_playlists',
  FAVORITES: 'yousong_favorites',
  POPUPS: 'yousong_popups',
  MAINTENANCE: 'yousong_maintenance',
  BANNER: 'yousong_banner',
  REQUESTS: 'yousong_requests',
  CURRENT_USER: 'yousong_session_user',
  DISMISSED_POPUPS: 'yousong_dismissed_popups',
};

// Password hash simulator
function hashPassword(pass: string): string {
  let hash = 0;
  for (let i = 0; i < pass.length; i++) {
    const char = pass.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hash_v2_${Math.abs(hash).toString(16)}_${btoa(pass).slice(0, 8)}`;
}

class StorageService {
  private users: User[] = [];
  private passwords: Record<string, string> = {};
  private songs: Song[] = [];
  private playlists: Playlist[] = [];
  private favorites: Record<string, string[]> = {};
  private popups: PopupMessage[] = [];
  private maintenance: MaintenanceState = INITIAL_MAINTENANCE;
  private banner: BannerConfig = INITIAL_BANNER;
  private requests: SongRequest[] = INITIAL_REQUESTS;
  private dismissedPopups: Record<string, string[]> = {};

  constructor() {
    this.init();
  }

  private init() {
    try {
      // 1. Users
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
      } else {
        this.users = [...INITIAL_USERS];
        this.saveUsers();
      }

      // 2. Passwords
      const storedPasswords = localStorage.getItem(STORAGE_KEYS.PASSWORDS);
      if (storedPasswords) {
        this.passwords = JSON.parse(storedPasswords);
      } else {
        this.passwords = {
          'user-admin': hashPassword('admin123'),
          'user-alex': hashPassword('music123'),
          'user-pending-1': hashPassword('chem123'),
          'user-pending-2': hashPassword('art123'),
        };
        this.savePasswords();
      }

      // 3. Songs (Completely empty library for admin manual upload)
      const isCleanSlate = localStorage.getItem('yousong_clean_manual_upload_v5');
      if (!isCleanSlate) {
        this.songs = [];
        this.saveSongs();
        this.favorites = {};
        this.saveFavorites();
        localStorage.setItem('yousong_clean_manual_upload_v5', 'true');
      } else {
        const storedSongs = localStorage.getItem(STORAGE_KEYS.SONGS);
        this.songs = storedSongs ? JSON.parse(storedSongs) : [];
      }

      // 4. Playlists
      const storedPlaylists = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      if (storedPlaylists) {
        this.playlists = JSON.parse(storedPlaylists);
      } else {
        this.playlists = [...INITIAL_PLAYLISTS];
        this.savePlaylists();
      }

      // 5. Favorites
      const storedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (storedFavorites) {
        this.favorites = JSON.parse(storedFavorites);
      } else {
        this.favorites = {
          'user-alex': ['song-clair-de-lune', 'song-2'],
        };
        this.saveFavorites();
      }

      // 6. Popups
      const storedPopups = localStorage.getItem(STORAGE_KEYS.POPUPS);
      if (storedPopups) {
        this.popups = JSON.parse(storedPopups);
      } else {
        this.popups = [...INITIAL_POPUPS];
        this.savePopups();
      }

      // 7. Maintenance
      const storedMaintenance = localStorage.getItem(STORAGE_KEYS.MAINTENANCE);
      if (storedMaintenance) {
        this.maintenance = JSON.parse(storedMaintenance);
      } else {
        this.maintenance = { ...INITIAL_MAINTENANCE };
        this.saveMaintenance();
      }

      // 8. Banner Config
      const storedBanner = localStorage.getItem(STORAGE_KEYS.BANNER);
      if (storedBanner) {
        this.banner = JSON.parse(storedBanner);
      } else {
        this.banner = { ...INITIAL_BANNER };
        this.saveBanner();
      }

      // 9. Song Requests
      const storedRequests = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      if (storedRequests) {
        this.requests = JSON.parse(storedRequests);
      } else {
        this.requests = [...INITIAL_REQUESTS];
        this.saveRequests();
      }

      // 10. Dismissed Popups
      const storedDismissed = localStorage.getItem(STORAGE_KEYS.DISMISSED_POPUPS);
      if (storedDismissed) {
        this.dismissedPopups = JSON.parse(storedDismissed);
      }
    } catch (e) {
      console.error('Failed to initialize YouSong local storage:', e);
    }
  }

  // --- Persistence Savers ---
  private saveUsers() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
  }

  private savePasswords() {
    localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(this.passwords));
  }

  private saveSongs() {
    localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(this.songs));
  }

  private savePlaylists() {
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(this.playlists));
  }

  private saveFavorites() {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(this.favorites));
  }

  private savePopups() {
    localStorage.setItem(STORAGE_KEYS.POPUPS, JSON.stringify(this.popups));
  }

  private saveMaintenance() {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(this.maintenance));
  }

  private saveBanner() {
    localStorage.setItem(STORAGE_KEYS.BANNER, JSON.stringify(this.banner));
  }

  private saveRequests() {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(this.requests));
  }

  private saveDismissed() {
    localStorage.setItem(STORAGE_KEYS.DISMISSED_POPUPS, JSON.stringify(this.dismissedPopups));
  }

  // --- Banner & Branding ---
  getBanner(): BannerConfig {
    return { ...this.banner };
  }

  updateBanner(updates: Partial<BannerConfig>): BannerConfig {
    this.banner = { ...this.banner, ...updates };
    this.saveBanner();

    // Sync with server
    fetch('/api/admin/banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.banner),
    }).catch((e) => console.warn('Server banner sync ignored:', e));

    return { ...this.banner };
  }

  // --- Maintenance Mode with Countdown ---
  getMaintenanceState(): MaintenanceState {
    return { ...this.maintenance };
  }

  setMaintenanceState(
    enabled: boolean,
    message?: string,
    hasCountdown?: boolean,
    estimatedFinishTime?: string | null
  ): MaintenanceState {
    this.maintenance = {
      enabled,
      message: message || this.maintenance.message,
      updatedAt: new Date().toISOString(),
      hasCountdown: !!hasCountdown,
      estimatedFinishTime: hasCountdown ? estimatedFinishTime || null : null,
    };
    this.saveMaintenance();

    fetch('/api/admin/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.maintenance),
    }).catch((e) => console.warn('Server maintenance sync ignored:', e));

    return { ...this.maintenance };
  }

  // --- Song Requests System ---
  getRequests(): SongRequest[] {
    return [...this.requests];
  }

  createRequest(data: {
    songTitle: string;
    artist?: string;
    webLink?: string;
    notes?: string;
    requestedByUserId?: string;
    requestedByUsername: string;
  }): SongRequest {
    const newReq: SongRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      songTitle: data.songTitle.trim(),
      artist: (data.artist || '').trim(),
      webLink: (data.webLink || '').trim(),
      notes: (data.notes || '').trim(),
      requestedByUserId: data.requestedByUserId || 'guest',
      requestedByUsername: data.requestedByUsername.trim() || 'Student',
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    this.requests.unshift(newReq);
    this.saveRequests();

    fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReq),
    }).catch((e) => console.warn('Server request sync ignored:', e));

    return newReq;
  }

  updateRequestStatus(id: string, status: SongRequest['status'], adminNote?: string): boolean {
    const r = this.requests.find((item) => item.id === id);
    if (!r) return false;
    r.status = status;
    if (adminNote !== undefined) r.adminNote = adminNote;
    this.saveRequests();

    fetch(`/api/admin/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNote }),
    }).catch((e) => console.warn('Server patch request ignored:', e));

    return true;
  }

  deleteRequest(id: string): boolean {
    this.requests = this.requests.filter((r) => r.id !== id);
    this.saveRequests();

    fetch(`/api/admin/requests/${id}`, { method: 'DELETE' }).catch((e) =>
      console.warn('Server delete request ignored:', e)
    );
    return true;
  }

  // --- User Auth & Accounts ---
  getCurrentSessionUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      const live = this.users.find((u) => u.id === parsed.id);
      return live || null;
    } catch {
      return null;
    }
  }

  setCurrentSessionUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  login(usernameAttempt: string, passwordAttempt: string): { success: boolean; user?: User; error?: string } {
    const cleanUsername = usernameAttempt.trim().toLowerCase();
    const user = this.users.find((u) => u.username.toLowerCase() === cleanUsername);

    if (!user) {
      return { success: false, error: 'User does not exist. You can submit an account request below.' };
    }

    if (!user.isApproved) {
      return {
        success: false,
        error: 'Your account is pending LiamDev12027 approval. Check back soon or remind the admin!',
      };
    }

    const hashedAttempt = hashPassword(passwordAttempt);
    if (this.passwords[user.id] !== hashedAttempt) {
      return { success: false, error: 'Incorrect password.' };
    }

    this.setCurrentSessionUser(user);
    return { success: true, user };
  }

  requestAccount(username: string, passwordAttempt: string, note?: string): { success: boolean; user?: User; error?: string } {
    const clean = username.trim();
    if (!clean) return { success: false, error: 'Username is required.' };
    if (passwordAttempt.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    const existing = this.users.find((u) => u.username.toLowerCase() === clean.toLowerCase());
    if (existing) {
      return { success: false, error: 'Username is already taken or pending approval.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      username: clean,
      role: 'user',
      isApproved: false,
      note: note?.trim(),
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.passwords[newUser.id] = hashPassword(passwordAttempt);
    this.saveUsers();
    this.savePasswords();

    return { success: true, user: newUser };
  }

  changeOwnPassword(userId: string, currentPasswordAttempt: string, newPasswordChosen: string): { success: boolean; error?: string } {
    if (newPasswordChosen.length < 4) {
      return { success: false, error: 'New password must be at least 4 characters long.' };
    }

    const currentHash = this.passwords[userId];
    if (currentHash !== hashPassword(currentPasswordAttempt)) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    this.passwords[userId] = hashPassword(newPasswordChosen);
    this.savePasswords();

    const user = this.users.find((u) => u.id === userId);
    if (user && user.temporaryPasswordAssigned) {
      user.temporaryPasswordAssigned = false;
      this.saveUsers();
    }

    return { success: true };
  }

  // --- Admin User Management ---
  getUsers(): User[] {
    return [...this.users];
  }

  approveAccount(userId: string): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return false;
    user.isApproved = true;
    this.saveUsers();
    return true;
  }

  rejectAccount(userId: string): boolean {
    this.users = this.users.filter((u) => u.id !== userId);
    delete this.passwords[userId];
    this.saveUsers();
    this.savePasswords();
    return true;
  }

  adminUpdateUser(userId: string, newUsername?: string, newTemporaryPassword?: string): { success: boolean; error?: string } {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return { success: false, error: 'User not found.' };

    if (newUsername && newUsername.trim()) {
      const clean = newUsername.trim();
      const existing = this.users.find((u) => u.id !== userId && u.username.toLowerCase() === clean.toLowerCase());
      if (existing) {
        return { success: false, error: 'Username is already taken by another account.' };
      }
      user.username = clean;
    }

    if (newTemporaryPassword && newTemporaryPassword.trim()) {
      if (newTemporaryPassword.length < 4) {
        return { success: false, error: 'Password must be at least 4 characters long.' };
      }
      this.passwords[userId] = hashPassword(newTemporaryPassword.trim());
      user.temporaryPasswordAssigned = true;
      this.savePasswords();
    }

    this.saveUsers();
    return { success: true };
  }

  deleteUser(userId: string): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (!user || user.role === 'admin') return false;
    this.users = this.users.filter((u) => u.id !== userId);
    delete this.passwords[userId];
    delete this.favorites[userId];
    this.playlists = this.playlists.filter((p) => p.userId !== userId);
    this.saveUsers();
    this.savePasswords();
    this.saveFavorites();
    this.savePlaylists();
    return true;
  }

  // --- Songs Library ---
  getSongs(): Song[] {
    return [...this.songs];
  }

  // Dynamic Genres: only genres that currently exist across the songs library
  getActiveGenres(): string[] {
    const set = new Set<string>();
    this.songs.forEach((s) => {
      if (s.genre && s.genre.trim()) {
        set.add(s.genre.trim());
      }
    });
    const sorted = Array.from(set).sort();
    return ['All', ...sorted];
  }

  addSong(songData: Omit<Song, 'id' | 'addedAt' | 'plays'>): Song {
    const newSong: Song = {
      ...songData,
      id: `song-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      addedAt: new Date().toISOString(),
      plays: 0,
      tags: songData.tags || [songData.genre.toLowerCase(), 'focus'],
    };
    this.songs.unshift(newSong);
    this.saveSongs();
    return newSong;
  }

  updateSong(songId: string, updates: Partial<Song>): boolean {
    const index = this.songs.findIndex((s) => s.id === songId);
    if (index === -1) return false;
    this.songs[index] = { ...this.songs[index], ...updates };
    this.saveSongs();
    return true;
  }

  deleteSong(songId: string): boolean {
    this.songs = this.songs.filter((s) => s.id !== songId);
    this.playlists.forEach((p) => {
      p.songIds = p.songIds.filter((id) => id !== songId);
    });
    Object.keys(this.favorites).forEach((uid) => {
      this.favorites[uid] = this.favorites[uid].filter((id) => id !== songId);
    });
    this.saveSongs();
    this.savePlaylists();
    this.saveFavorites();
    return true;
  }

  clearAllSongs() {
    this.songs = [];
    this.saveSongs();
    this.playlists.forEach((p) => {
      p.songIds = [];
    });
    this.savePlaylists();
    this.favorites = {};
    this.saveFavorites();
  }

  recordPlay(songId: string) {
    const s = this.songs.find((item) => item.id === songId);
    if (s) {
      s.plays = (s.plays || 0) + 1;
      this.saveSongs();
    }
  }

  incrementSongPlay(songId: string) {
    this.recordPlay(songId);
  }

  // --- Playlists ---
  getPlaylists(userId?: string): Playlist[] {
    if (!userId) return [...this.playlists];
    return this.playlists.filter((p) => p.userId === userId);
  }

  getUserPlaylists(userId?: string): Playlist[] {
    return this.getPlaylists(userId);
  }

  createPlaylist(userId: string, name: string, description?: string, coverUrl?: string): Playlist {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      name: name.trim(),
      description: description?.trim(),
      coverUrl: coverUrl || '/src/assets/images/lofi_study_glass_1791054585559.jpg',
      songIds: [],
      createdAt: new Date().toISOString(),
    };
    this.playlists.unshift(newPlaylist);
    this.savePlaylists();
    return newPlaylist;
  }

  addSongToPlaylist(playlistId: string, songId: string): boolean {
    const pl = this.playlists.find((p) => p.id === playlistId);
    if (!pl) return false;
    if (!pl.songIds.includes(songId)) {
      pl.songIds.push(songId);
      this.savePlaylists();
    }
    return true;
  }

  removeSongFromPlaylist(playlistId: string, songId: string): boolean {
    const pl = this.playlists.find((p) => p.id === playlistId);
    if (!pl) return false;
    pl.songIds = pl.songIds.filter((id) => id !== songId);
    this.savePlaylists();
    return true;
  }

  deletePlaylist(playlistId: string): boolean {
    this.playlists = this.playlists.filter((p) => p.id !== playlistId);
    this.savePlaylists();
    return true;
  }

  // --- Favorites ---
  getFavorites(userId: string): string[] {
    return this.favorites[userId] || [];
  }

  getUserFavorites(userId: string): string[] {
    return this.getFavorites(userId);
  }

  toggleFavorite(userId: string, songId: string): boolean {
    if (!this.favorites[userId]) {
      this.favorites[userId] = [];
    }
    const idx = this.favorites[userId].indexOf(songId);
    let isFav = false;
    if (idx > -1) {
      this.favorites[userId].splice(idx, 1);
      isFav = false;
    } else {
      this.favorites[userId].push(songId);
      isFav = true;
    }
    this.saveFavorites();
    return isFav;
  }

  // --- Popups ---
  getAllPopups(): PopupMessage[] {
    return [...this.popups];
  }

  getActivePopupsForUser(userId?: string): PopupMessage[] {
    const deviceDismissed = new Set(this.dismissedPopups['_device'] || []);
    const userDismissed = new Set(userId ? this.dismissedPopups[userId] || [] : []);
    const guestDismissed = new Set(this.dismissedPopups['guest'] || []);
    const allDismissed = new Set([...deviceDismissed, ...userDismissed, ...guestDismissed]);

    return this.popups.filter((p) => {
      if (!p.active) return false;
      if (allDismissed.has(p.id)) return false;
      if (p.targetUserId === 'all') return true;
      if (userId && p.targetUserId === userId) return true;
      return false;
    });
  }

  createPopup(
    targetUserId: string,
    title: string,
    message: string,
    type: PopupMessage['type'] = 'announcement'
  ): PopupMessage {
    const newPopup: PopupMessage = {
      id: `popup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      targetUserId,
      title: title.trim(),
      message: message.trim(),
      type,
      createdAt: new Date().toISOString(),
      active: true,
    };
    this.popups.unshift(newPopup);
    this.savePopups();
    return newPopup;
  }

  dismissPopup(popupId: string, userId?: string) {
    if (!this.dismissedPopups['_device']) {
      this.dismissedPopups['_device'] = [];
    }
    if (!this.dismissedPopups['_device'].includes(popupId)) {
      this.dismissedPopups['_device'].push(popupId);
    }

    const targetKey = userId || 'guest';
    if (!this.dismissedPopups[targetKey]) {
      this.dismissedPopups[targetKey] = [];
    }
    if (!this.dismissedPopups[targetKey].includes(popupId)) {
      this.dismissedPopups[targetKey].push(popupId);
    }

    this.saveDismissed();
  }

  revokePopup(popupId: string): boolean {
    const p = this.popups.find((item) => item.id === popupId);
    if (!p) return false;
    p.active = false;
    this.savePopups();
    return true;
  }

  deletePopup(popupId: string): boolean {
    this.popups = this.popups.filter((item) => item.id !== popupId);
    this.savePopups();
    return true;
  }
}

export const storage = new StorageService();
