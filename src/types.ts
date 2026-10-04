export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  isApproved: boolean;
  note?: string; // Why they want to be added
  createdAt: string;
  temporaryPasswordAssigned?: boolean;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre: string;
  tags?: string[]; // e.g. ['piano', 'classical', 'study', 'debussy']
  typeMood?: string; // e.g. 'Instrumental', 'Acoustic', 'Chill Beats', 'Focus'
  duration: number; // in seconds
  audioUrl: string;
  coverUrl: string;
  addedAt: string;
  plays?: number;
  featured?: boolean;
  description?: string;
}

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverUrl?: string;
  songIds: string[];
  createdAt: string;
}

export type PopupType = 'announcement' | 'alert' | 'music' | 'message';

export interface PopupMessage {
  id: string;
  targetUserId: string; // 'all' or specific userId
  title: string;
  message: string;
  type: PopupType;
  createdAt: string;
  active: boolean;
}

export interface MaintenanceState {
  enabled: boolean;
  message: string;
  updatedAt: string;
  hasCountdown?: boolean;
  estimatedFinishTime?: string | null; // ISO string e.g. "2026-10-03T18:00:00.000Z"
}

export type BannerColorTheme =
  | 'cyan-violet'
  | 'emerald-cyber'
  | 'amber-rose'
  | 'sapphire-ice'
  | 'ruby-glow'
  | 'midnight-mono';

export interface BannerConfig {
  enabled: boolean;
  versionName: string; // e.g. "v2.5 Liquid Crystal"
  sloganText: string; // e.g. "School Audio Stream Hub · by LiamDev12027"
  colorTheme: BannerColorTheme;
  ribbonEnabled: boolean;
  ribbonNotice: string;
}

export type SongRequestStatus = 'pending' | 'approved' | 'declined';

export interface SongRequest {
  id: string;
  songTitle: string;
  artist?: string;
  webLink?: string;
  notes?: string;
  requestedByUserId?: string;
  requestedByUsername: string;
  createdAt: string;
  status: SongRequestStatus;
  adminNote?: string;
}

export type RepeatMode = 'off' | 'all' | 'one';
