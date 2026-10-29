import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { AppUser } from '../types';

interface AuthContextType {
  currentUser: AppUser | null;
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithAdminCredentials: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'nexus_ai_admin_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync user profile to Firestore
  const syncUserProfile = async (user: AppUser) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          id: user.uid,
          email: user.email,
          displayName: user.displayName || 'Pengguna',
          photoURL: user.photoURL || '',
          role: user.role,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        });
      } else {
        await setDoc(
          userRef,
          {
            lastLoginAt: new Date().toISOString(),
            displayName: user.displayName || userSnap.data()?.displayName || 'Pengguna',
            photoURL: user.photoURL || userSnap.data()?.photoURL || '',
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.warn('Could not sync user profile to Firestore (may be offline or admin token):', err);
    }
  };

  useEffect(() => {
    // 1. Check for stored admin session first
    const savedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (savedAdmin) {
      try {
        const parsedAdmin: AppUser = JSON.parse(savedAdmin);
        setCurrentUser(parsedAdmin);
        setIsLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem(ADMIN_STORAGE_KEY);
      }
    }

    // 2. Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: User | null) => {
      // If admin session already logged in, keep it unless user actively changes
      const currentAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (currentAdmin) {
        setIsLoading(false);
        return;
      }

      if (fbUser) {
        const isAdminEmail = fbUser.email === 'alifia.syifaul.2302316@students.um.ac.id';
        const appUser: AppUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Pengguna',
          photoURL: fbUser.photoURL,
          role: isAdminEmail ? 'admin' : 'user',
          isAdmin: isAdminEmail,
          provider: 'google',
        };

        setCurrentUser(appUser);
        await syncUserProfile(appUser);
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const isAdminEmail = fbUser.email === 'alifia.syifaul.2302316@students.um.ac.id';

      const appUser: AppUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || 'Pengguna Google',
        photoURL: fbUser.photoURL,
        role: isAdminEmail ? 'admin' : 'user',
        isAdmin: isAdminEmail,
        provider: 'google',
      };

      setCurrentUser(appUser);
      await syncUserProfile(appUser);
    } catch (err: any) {
      console.error('Login with Google error:', err);
      setError(err?.message || 'Gagal masuk dengan Google. Pastikan popup tidak diblokir.');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithAdminCredentials = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Username atau password admin salah');
      }

      const adminUser: AppUser = {
        uid: data.user.uid,
        email: data.user.email,
        displayName: data.user.displayName,
        username: data.user.username,
        photoURL: data.user.avatar,
        role: 'admin',
        isAdmin: true,
        provider: 'admin-credentials',
        token: data.token,
      };

      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
      setCurrentUser(adminUser);
      return true;
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err?.message || 'Gagal melakukan login admin.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      if (auth.currentUser) {
        await fbSignOut(auth);
      }
      setCurrentUser(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        error,
        loginWithGoogle,
        loginWithAdminCredentials,
        logout,
        clearError,
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
