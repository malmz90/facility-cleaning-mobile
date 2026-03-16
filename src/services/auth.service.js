import { supabase } from '../lib/supabase';

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      // The stored refresh token is invalid or has been revoked (e.g. the token
      // was rotated, the project was reset, or the user was signed out remotely).
      // Supabase may not always clear the stale session automatically, so we do
      // it explicitly here to prevent the same error on every subsequent launch.
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
      return { session: null, error: null };
    }

    return { session: data?.session ?? null, error: null };
  } catch (err) {
    // Supabase's internal auto-refresh timer can throw if the refresh token is
    // invalid. Treat any thrown error the same way: no valid session.
    await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    return { session: null, error: null };
  }
}

export async function signInWithEmail({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { user: data?.user ?? null, session: data?.session ?? null, error };
}

export async function signOut() {
  // Use local scope so logging out on mobile does not revoke web sessions.
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  return { error };
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session ?? null);
  });
}

export async function getOrganizationMemberships(userId) {
  const { data, error } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', userId);

  return {
    memberships: data ?? [],
    error,
  };
}
