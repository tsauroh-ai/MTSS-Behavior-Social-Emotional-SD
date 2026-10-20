import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api, setCurrentApiUserId } from '../lib/api';
import { saveUserNameToFirestore } from '../lib/firebaseSync';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  loading: boolean;
  switchUser: (userId: string) => void;
  updateUserName: (name: string, roleTitle?: string) => Promise<boolean>;
  // Role checks
  isGuru: boolean;
  isKoordinator: boolean;
  isKonselor: boolean;
  isAdmin: boolean;
  isPimpinan: boolean;
  // Permission checks
  canWriteObservations: boolean;
  canManageSupportPlans: boolean;
  canConductReview: boolean;
  canChangeTier: boolean;
  canManageUsers: boolean;
  canEditConfig: boolean;
  canViewAuditTrail: boolean;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const users = await api.getUsers();
      setAllUsers(users);
      
      const savedUserId = localStorage.getItem('mtss_active_user_id') || users[0]?.id;
      const initialUser = users.find(u => u.id === savedUserId) || users[0];
      
      if (initialUser) {
        // Also check if there is a customized saved name for this user in localStorage
        const customName = localStorage.getItem(`mtss_saved_author_name_${initialUser.id}`);
        const userToSet = customName ? { ...initialUser, name: customName } : initialUser;
        setCurrentUser(userToSet);
        setCurrentApiUserId(initialUser.id);
      }
    } catch (err) {
      console.error('Failed to load users for auth', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const switchUser = (userId: string) => {
    const target = allUsers.find(u => u.id === userId);
    if (target) {
      const customName = localStorage.getItem(`mtss_saved_author_name_${target.id}`);
      const userToSet = customName ? { ...target, name: customName } : target;
      setCurrentUser(userToSet);
      setCurrentApiUserId(target.id);
      localStorage.setItem('mtss_active_user_id', target.id);
    }
  };

  const updateUserName = async (name: string, roleTitle?: string): Promise<boolean> => {
    if (!currentUser || !name.trim()) return false;
    const cleanName = name.trim();
    const cleanTitle = roleTitle?.trim();

    try {
      // 1. Update local storage for active user
      localStorage.setItem(`mtss_saved_author_name_${currentUser.id}`, cleanName);
      localStorage.setItem('mtss_last_author_name', cleanName);

      // 2. Update state immediately
      const updatedUser: User = {
        ...currentUser,
        name: cleanName,
        ...(cleanTitle ? { roleTitle: cleanTitle } : {}),
      };
      setCurrentUser(updatedUser);
      setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));

      // 3. Save to backend API
      try {
        await api.updateProfileName(cleanName, cleanTitle);
      } catch (e) {
        console.warn('Backend profile update note:', e);
      }

      // 4. Save directly to Cloud Firestore users collection
      try {
        await saveUserNameToFirestore(currentUser.id, cleanName, cleanTitle);
      } catch (e) {
        console.warn('Firestore profile sync note:', e);
      }

      return true;
    } catch (err) {
      console.error('Failed to update user name:', err);
      return false;
    }
  };


  const role = currentUser?.role;

  const isGuru = role === 'guru';
  const isKoordinator = role === 'koordinator_mtss';
  const isKonselor = role === 'konselor';
  const isAdmin = role === 'admin';
  const isPimpinan = role === 'pimpinan';

  const canWriteObservations = isGuru || isKoordinator || isKonselor;
  const canManageSupportPlans = isGuru || isKoordinator || isKonselor || isAdmin;
  const canConductReview = isKoordinator || isKonselor || isAdmin;
  const canChangeTier = isKoordinator || isAdmin;
  const canManageUsers = isAdmin;
  const canEditConfig = isAdmin || isKoordinator;
  const canViewAuditTrail = isAdmin || isKoordinator || isPimpinan;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        loading,
        switchUser,
        updateUserName,
        isGuru,

        isKoordinator,
        isKonselor,
        isAdmin,
        isPimpinan,
        canWriteObservations,
        canManageSupportPlans,
        canConductReview,
        canChangeTier,
        canManageUsers,
        canEditConfig,
        canViewAuditTrail,
        refreshUsers: fetchInitialData,
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
