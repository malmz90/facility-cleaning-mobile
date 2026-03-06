import { supabase } from '../lib/supabase';

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data?.session ?? null, error };
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
