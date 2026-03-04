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
      const { session: currentSession, error } = await getSession();
      if (error) {
        console.warn('Failed to load auth session:', error.message);
      }
      if (isMounted) {
        setSession(currentSession);
        if (currentSession?.user?.id) {
          await loadMemberships(currentSession.user.id);
        }
        setLoading(false);
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = onAuthStateChange(nextSession => {
      setSession(nextSession);
      if (!nextSession?.user?.id) {
        setMemberships([]);
        setOrganizationId(null);
        setRole(null);
        return;
      }
      loadMemberships(nextSession.user.id);
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
      if (result.session.user?.id) {
        await loadMemberships(result.session.user.id);
      }
    }
    return result;
  };

  const signOut = async () => {
    const result = await signOutService();
    if (!result.error) {
      setSession(null);
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
      user: session?.user ?? null,
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
    [loading, memberships, organizationId, role, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
