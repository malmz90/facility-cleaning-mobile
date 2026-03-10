import { supabase } from '../lib/supabase';

export async function fetchBuildingsByOrganization(organizationId) {
  const { data, error } = await supabase
    .from('buildings')
    .select('id, name, address')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true });

  return {
    data: data ?? [],
    error,
  };
}

export async function fetchRoomsByBuilding({ buildingId, organizationId }) {
  let query = supabase
    .from('rooms')
    .select('id, name, cleaning_frequency')
    .eq('building_id', buildingId);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query.order('name', { ascending: true });

  return {
    data: data ?? [],
    error,
  };
}

export async function fetchRoomByQrCode(qrCodeId) {
  const { data, error } = await supabase
    .from('rooms')
    .select('id, organization_id, building_id, name, instructions, cleaning_frequency, qr_code_id')
    .eq('qr_code_id', qrCodeId)
    .maybeSingle();

  return {
    data: data ?? null,
    error,
  };
}

export async function fetchRoomById(roomId) {
  const { data, error } = await supabase
    .from('rooms')
    .select('id, organization_id, building_id, name, instructions, cleaning_frequency, qr_code_id')
    .eq('id', roomId)
    .maybeSingle();

  return {
    data: data ?? null,
    error,
  };
}

export async function createRoom({
  organizationId,
  buildingId,
  name,
  instructions,
  cleaningFrequency,
  qrCodeId,
}) {
  const payload = {
    organization_id: organizationId,
    building_id: buildingId,
    name,
    instructions: instructions || null,
    cleaning_frequency: cleaningFrequency,
    qr_code_id: qrCodeId,
  };

  const { data, error } = await supabase
    .from('rooms')
    .insert(payload)
    .select('id, organization_id, building_id, name, instructions, cleaning_frequency, qr_code_id')
    .single();

  return {
    data: data ?? null,
    error,
  };
}
