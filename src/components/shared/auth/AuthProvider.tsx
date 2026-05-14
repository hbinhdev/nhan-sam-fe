"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AUTH_SESSION_CHANGED_EVENT,
  AUTH_STORAGE_KEY,
  clearAuthSession,
  getAuthSession,
  type AuthResponse,
  type AuthUser,
} from "@/lib/auth-api";

type AuthContextValue = {
  session: AuthResponse | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  refreshSession: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const refreshSession = useCallback(() => {
    setSession(getAuthSession());
  }, []);

  const signOut = useCallback(() => {
    clearAuthSession();
    setSession(null);
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      setSession(getAuthSession());
      setIsAuthLoading(false);
    });

    const handleAuthSessionChanged = (event: Event) => {
      const customEvent = event as CustomEvent<AuthResponse | null>;
      setSession(customEvent.detail ?? null);
      setIsAuthLoading(false);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_STORAGE_KEY) {
        return;
      }

      setSession(getAuthSession());
      setIsAuthLoading(false);
    };

    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleAuthSessionChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleAuthSessionChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const contextValue = useMemo<AuthContextValue>(() => {
    const isAuthenticated = Boolean(session?.access_token && session?.user);
    return {
      session,
      user: session?.user ?? null,
      isAuthenticated,
      isAuthLoading,
      refreshSession,
      signOut,
    };
  }, [isAuthLoading, refreshSession, session, signOut]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

