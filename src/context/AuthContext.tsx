import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  MaintenanceState,
  PopupMessage,
  PopupType,
  BannerConfig,
  SongRequest,
  SongRequestStatus,
} from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  maintenanceState: MaintenanceState;
  bannerConfig: BannerConfig;
  updateBannerConfig: (updates: Partial<BannerConfig>) => void;
  login: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  requestAccount: (username: string, pass: string, note: string) => Promise<{ success: boolean; error?: string }>;
  changeOwnPassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  activePopups: PopupMessage[];
  dismissPopup: (popupId: string) => void;
  refreshState: () => void;

  // Song Requests
  songRequests: SongRequest[];
  submitSongRequest: (data: { songTitle: string; artist?: string; webLink?: string; notes?: string }) => SongRequest;
  updateSongRequestStatus: (id: string, status: SongRequestStatus, adminNote?: string) => void;
  deleteSongRequest: (id: string) => void;

  // Admin actions
  allUsers: User[];
  allPopups: PopupMessage[];
  approveAccount: (userId: string) => void;
  rejectAccount: (userId: string) => void;
  adminUpdateUser: (userId: string, newUsername?: string, newPassword?: string) => Promise<{ success: boolean; error?: string }>;
  adminDeleteUser: (userId: string) => void;
  setMaintenance: (enabled: boolean, message?: string, hasCountdown?: boolean, estimatedFinishTime?: string | null) => void;
  createBroadcastPopup: (targetUserId: string, title: string, message: string, type?: PopupType) => void;
  revokePopup: (popupId: string) => void;
  deletePopup: (popupId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentSessionUser());
  const [maintenanceState, setMaintenanceState] = useState<MaintenanceState>(() => storage.getMaintenanceState());
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>(() => storage.getBanner());
  const [songRequests, setSongRequests] = useState<SongRequest[]>(() => storage.getRequests());
  const [allUsers, setAllUsers] = useState<User[]>(() => storage.getUsers());
  const [allPopups, setAllPopups] = useState<PopupMessage[]>(() => storage.getAllPopups());
  const [activePopups, setActivePopups] = useState<PopupMessage[]>([]);

  const refreshState = useCallback(() => {
    const liveUser = storage.getCurrentSessionUser();
    setCurrentUser(liveUser);
    setMaintenanceState(storage.getMaintenanceState());
    setBannerConfig(storage.getBanner());
    setSongRequests(storage.getRequests());
    setAllUsers(storage.getUsers());
    setAllPopups(storage.getAllPopups());

    const unreadPopups = storage.getActivePopupsForUser(liveUser?.id);
    setActivePopups((prev) => {
      const prevIds = prev.map((p) => p.id).sort().join(',');
      const nextIds = unreadPopups.map((p) => p.id).sort().join(',');
      return prevIds === nextIds ? prev : unreadPopups;
    });
  }, []);

  useEffect(() => {
    refreshState();
    const interval = setInterval(refreshState, 10000);
    return () => clearInterval(interval);
  }, [refreshState]);

  const login = async (username: string, pass: string) => {
    const res = storage.login(username, pass);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      refreshState();
    }
    return res;
  };

  const logout = () => {
    storage.setCurrentSessionUser(null);
    setCurrentUser(null);
    refreshState();
  };

  const requestAccount = async (username: string, pass: string, note: string) => {
    const res = storage.requestAccount(username, pass, note);
    if (res.success) {
      refreshState();
    }
    return res;
  };

  const changeOwnPassword = async (currentPass: string, newPass: string) => {
    if (!currentUser) return { success: false, error: 'Not logged in' };
    const res = storage.changeOwnPassword(currentUser.id, currentPass, newPass);
    if (res.success) {
      refreshState();
    }
    return res;
  };

  const dismissPopup = (popupId: string) => {
    storage.dismissPopup(popupId, currentUser?.id);
    setActivePopups((prev) => prev.filter((p) => p.id !== popupId));
  };

  const updateBannerConfig = (updates: Partial<BannerConfig>) => {
    const updated = storage.updateBanner(updates);
    setBannerConfig(updated);
  };

  const submitSongRequest = (data: { songTitle: string; artist?: string; webLink?: string; notes?: string }) => {
    const newReq = storage.createRequest({
      ...data,
      requestedByUserId: currentUser?.id,
      requestedByUsername: currentUser?.username || 'Guest Student',
    });
    setSongRequests(storage.getRequests());
    return newReq;
  };

  const updateSongRequestStatus = (id: string, status: SongRequestStatus, adminNote?: string) => {
    storage.updateRequestStatus(id, status, adminNote);
    setSongRequests(storage.getRequests());
  };

  const deleteSongRequest = (id: string) => {
    storage.deleteRequest(id);
    setSongRequests(storage.getRequests());
  };

  // Admin controls
  const approveAccount = (userId: string) => {
    storage.approveAccount(userId);
    refreshState();
  };

  const rejectAccount = (userId: string) => {
    storage.rejectAccount(userId);
    refreshState();
  };

  const adminUpdateUser = async (userId: string, newUsername?: string, newPassword?: string) => {
    const res = storage.adminUpdateUser(userId, newUsername, newPassword);
    if (res.success) {
      refreshState();
    }
    return res;
  };

  const adminDeleteUser = (userId: string) => {
    storage.deleteUser(userId);
    refreshState();
  };

  const setMaintenance = (
    enabled: boolean,
    message?: string,
    hasCountdown?: boolean,
    estimatedFinishTime?: string | null
  ) => {
    const updated = storage.setMaintenanceState(enabled, message, hasCountdown, estimatedFinishTime);
    setMaintenanceState(updated);
    refreshState();
  };

  const createBroadcastPopup = (
    targetUserId: string,
    title: string,
    message: string,
    type: PopupType = 'announcement'
  ) => {
    storage.createPopup(targetUserId, title, message, type);
    fetch('/api/popups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId, title, message, type }),
    }).catch(() => {});
    refreshState();
  };

  const revokePopup = (popupId: string) => {
    storage.revokePopup(popupId);
    refreshState();
  };

  const deletePopup = (popupId: string) => {
    storage.deletePopup(popupId);
    fetch(`/api/popups/${popupId}`, { method: 'DELETE' }).catch(() => {});
    refreshState();
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        maintenanceState,
        bannerConfig,
        updateBannerConfig,
        login,
        logout,
        requestAccount,
        changeOwnPassword,
        activePopups,
        dismissPopup,
        refreshState,
        songRequests,
        submitSongRequest,
        updateSongRequestStatus,
        deleteSongRequest,
        allUsers,
        allPopups,
        approveAccount,
        rejectAccount,
        adminUpdateUser,
        adminDeleteUser,
        setMaintenance,
        createBroadcastPopup,
        revokePopup,
        deletePopup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
