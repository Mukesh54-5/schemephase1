import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import type { AuthUser, FarmerProfile } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  profile: FarmerProfile | null;
  token: string | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (payload: {
    fullName: string;
    email: string;
    mobileNumber: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setProfileState: (profile: FarmerProfile | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function formatFirebaseAuthError(err: unknown): string {
  const code = typeof (err as { code?: unknown })?.code === 'string' ? (err as { code: string }).code : '';
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Google Sign-In window was closed before completing sign-in.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
    case 'auth/cancelled-popup-request':
      return 'Previous Google Sign-In request was cancelled. Please try again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Google Sign-In in Firebase. Please sign in using Email & Password.';
    case 'auth/network-request-failed':
      return 'Network error while connecting to Google Sign-In. Please check your internet connection.';
    default:
      return err instanceof Error ? err.message : 'Google Sign-In failed.';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const syncWithBackend = useCallback(async (authToken: string) => {
    const res = await fetch('/api/profile', {
      headers: { Authorization: `Bearer ${authToken}` },
      credentials: 'same-origin',
    });
    if (!res.ok) {
      throw new Error('Session invalid');
    }
    const data = await res.json();
    setUser(data.user);
    setProfile(data.profile ?? null);
  }, []);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          const res = await fetch('/api/auth/firebase-sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              Authorization: `Bearer ${idToken}`,
            },
            credentials: 'same-origin',
          });
          if (res.ok && active) {
            const data = await res.json();
            setToken(idToken);
            setUser(data.user);
            setProfile(data.profile ?? null);
          }
        } catch (err) {
          console.error('Firebase auth sync error:', err);
        } finally {
          if (active) setLoading(false);
        }
        return;
      }

      // Restore local session via HttpOnly cookie if present
      try {
        const res = await fetch('/api/auth/session', {
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          credentials: 'same-origin',
        });
        if (res.ok && active) {
          const data = await res.json();
          setToken(data.token ?? null);
          setUser(data.user ?? null);
          setProfile(data.profile ?? null);
        } else if (active) {
          setToken(null);
          setUser(null);
          setProfile(null);
        }
      } catch {
        if (active) {
          setToken(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await cred.user.getIdToken();
      const res = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${idToken}`,
        },
        credentials: 'same-origin',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Google Sign-In sync failed.');
      }
      const data = await res.json();
      setToken(idToken);
      setUser(data.user);
      setProfile(data.profile ?? null);
    } catch (err) {
      throw new Error(formatFirebaseAuthError(err));
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (auth.currentUser) {
      await signOut(auth).catch(() => {});
    }
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Login failed.');
    }
    setToken(data.token);
    setUser(data.user);
    setProfile(data.profile ?? null);
  };

  const registerWithEmail = async (payload: {
    fullName: string;
    email: string;
    mobileNumber: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (auth.currentUser) {
      await signOut(auth).catch(() => {});
    }
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        ...payload,
        fullName: payload.fullName.trim(),
        email: payload.email.trim(),
        mobileNumber: payload.mobileNumber.trim(),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed.');
    }
    setToken(data.token);
    setUser(data.user);
    setProfile(data.profile ?? null);
  };

  const logout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'same-origin',
    }).catch(() => {});
    if (auth.currentUser) {
      await signOut(auth).catch(() => {});
    }
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    let activeToken = token;
    if (auth.currentUser) {
      activeToken = await auth.currentUser.getIdToken();
      setToken(activeToken);
    }
    if (!activeToken) return;
    await syncWithBackend(activeToken);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        refreshProfile,
        setProfileState: setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
