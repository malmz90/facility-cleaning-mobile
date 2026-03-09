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
