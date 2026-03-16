import { supabase } from '../lib/supabase';

function toError(message) {
  return { message };
}

async function resolveCleanerProfileId(authUserId) {
  if (!authUserId) {
    return {
      cleanerProfileId: null,
      error: toError('Saknar användare för att koppla städlogg.'),
    };
  }

  // First try a common setup where profiles.id = auth.users.id.
  const byIdResult = await supabase.from('profiles').select('id').eq('id', authUserId).maybeSingle();

  if (byIdResult.error) {
    return { cleanerProfileId: null, error: byIdResult.error };
  }

  if (byIdResult.data?.id) {
    return { cleanerProfileId: byIdResult.data.id, error: null };
  }

  // Fallback for schemas where profiles has user_id -> auth.users.id.
  const byUserResult = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', authUserId)
    .limit(1)
    .maybeSingle();

  if (byUserResult.error) {
    const missingColumn = String(byUserResult.error.message || '')
      .toLowerCase()
      .includes('column profiles.user_id does not exist');

    if (!missingColumn) {
      return { cleanerProfileId: null, error: byUserResult.error };
    }
  }

  if (byUserResult.data?.id) {
    return { cleanerProfileId: byUserResult.data.id, error: null };
  }

  return {
    cleanerProfileId: null,
    error: toError('Ingen profil hittades för den inloggade användaren.'),
  };
}

export async function fetchRoomByScannedQr(scannedValue) {
  const { data, error } = await supabase
    .from('rooms')
    .select('id, name, instructions, cleaning_frequency')
    .eq('qr_code_id', scannedValue)
    .limit(1)
    .maybeSingle();

  return {
    data: data ?? null,
    error,
  };
}

export async function markRoomAsCleaned({ roomId, authUserId, note = null }) {
  const { cleanerProfileId, error: profileError } = await resolveCleanerProfileId(authUserId);
  if (profileError) {
    return {
      data: null,
      error: profileError,
    };
  }

  const payload = {
    room_id: roomId,
    cleaner_id: cleanerProfileId,
    note,
  };

  const { data, error } = await supabase
    .from('cleaning_logs')
    .insert(payload)
    .select('id, room_id, cleaner_id, cleaned_at')
    .single();

  return {
    data: data ?? null,
    error,
  };
}

export async function fetchCleanerHistory({ authUserId, limit = 50 }) {
  const { cleanerProfileId, error: profileError } = await resolveCleanerProfileId(authUserId);
  if (profileError) {
    return {
      data: [],
      error: profileError,
    };
  }

  const { data, error } = await supabase
    .from('cleaning_logs')
    .select('id, cleaned_at, rooms!inner(name)')
    .eq('cleaner_id', cleanerProfileId)
    .order('cleaned_at', { ascending: false })
    .limit(limit);

  const normalizedData =
    data?.map(item => ({
      id: item.id,
      cleaned_at: item.cleaned_at,
      room_name: item.rooms?.name ?? 'Okänt rum',
    })) ?? [];

  return {
    data: normalizedData,
    error,
  };
}
