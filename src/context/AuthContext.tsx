import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

export interface AuthErrorInfo {
  code: string;
  message: string;
  currentDomain: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  authError: AuthErrorInfo | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  authError: null,
  clearAuthError: () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<AuthErrorInfo | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      const code = error?.code || 'auth/unknown';
      const message = error?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google';
      const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

      setAuthError({
        code,
        message,
        currentDomain,
      });
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const isAdmin = user?.email === 'dormstaff2009@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        authError,
        clearAuthError,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
