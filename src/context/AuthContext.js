import React, { createContext, useEffect, useMemo, useState } from 'react';
import {
  getSession,
  getOrganizationMemberships,
  onAuthStateChange,
  signInWithEmail,
  signOut as signOutService,
} from '../services/auth.service';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [organizationId, setOrganizationId] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMemberships = async userId => {
    const { memberships: nextMemberships, error } = await getOrganizationMemberships(userId);

    if (error) {
      console.warn('Failed to load organization memberships:', error.message);
      setMemberships([]);
      setOrganizationId(null);
      setRole(null);
      return;
    }

    setMemberships(nextMemberships);

    if (nextMemberships.length === 1) {
      const onlyMembership = nextMemberships[0];
      setOrganizationId(onlyMembership.organization_id);
      setRole(onlyMembership.role);
      return;
    }

    setOrganizationId(null);
    setRole(null);
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        // On app start, restore the local session from AsyncStorage.
        const { session: currentSession, error } = await getSession();
        if (error) {
          console.warn('Failed to load auth session:', error.message);
        }

        if (!isMounted) {
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user?.id) {
          await loadMemberships(currentSession.user.id);
        } else {
          setMemberships([]);
          setOrganizationId(null);
          setRole(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = onAuthStateChange(async (event, nextSession) => {
      // Keep auth state in sync for sign in/refresh/sign out.
      try {
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setMemberships([]);
          setOrganizationId(null);
          setRole(null);
          return;
        }

        setSession(nextSession);
        setUser(nextSession?.user ?? null);

        if (!nextSession?.user?.id) {
          setMemberships([]);
          setOrganizationId(null);
          setRole(null);
          return;
        }

        await loadMemberships(nextSession.user.id);
      } finally {
        setLoading(false);
      }
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
      setUser(result.session.user ?? null);
      if (result.session.user?.id) {
        await loadMemberships(result.session.user.id);
      }
    }
    return result;
  };

  const signOut = async () => {
    // Signing out clears only this app's local Supabase session (AsyncStorage).
    const result = await signOutService();
    if (!result.error) {
      setSession(null);
      setUser(null);
      setMemberships([]);
      setOrganizationId(null);
      setRole(null);
    }
    return result;
  };

  useEffect(() => {
    if (!organizationId || memberships.length === 0) {
      setRole(null);
      return;
    }

    const selectedMembership = memberships.find(
      membership => membership.organization_id === organizationId
    );
    setRole(selectedMembership?.role ?? null);
  }, [memberships, organizationId]);

  const value = useMemo(
    () => ({
      session,
      user,
      isAuthenticated: Boolean(session),
      role,
      organizationId,
      organizations: memberships.map(item => ({
        organizationId: item.organization_id,
        role: item.role,
      })),
      setOrganizationId,
      loading,
      signIn,
      signOut,
    }),
    [loading, memberships, organizationId, role, session, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
