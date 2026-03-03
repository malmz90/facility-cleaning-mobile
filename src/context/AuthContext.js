import React, { createContext, useEffect, useMemo, useState } from 'react';
import {
  getSession,
  onAuthStateChange,
  signInWithEmail,
  signOut as signOutService,
} from '../services/auth.service';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const { session: currentSession, error } = await getSession();
      if (error) {
        console.warn('Failed to load auth session:', error.message);
      }
      if (isMounted) {
        setSession(currentSession);
        setLoading(false);
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = onAuthStateChange(nextSession => {
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async ({ email, password }) => {
    const result = await signInWithEmail({ email, password });
    if (!result.error && result.session) {
      setSession(result.session);
    }
    return result;
  };

  const signOut = async () => {
    const result = await signOutService();
    if (!result.error) {
      setSession(null);
    }
    return result;
  };

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      loading,
      signIn,
      signOut,
    }),
    [loading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
