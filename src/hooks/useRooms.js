import { useEffect, useState } from 'react';
import { fetchRoomsByBuilding } from '../services/owner.service';

export default function useRooms({ buildingId, organizationId }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadRooms = async () => {
      if (!buildingId) {
        setRooms([]);
        setLoading(false);
        setErrorMessage('');
        return;
      }

      setLoading(true);
      setErrorMessage('');

      const { data, error } = await fetchRoomsByBuilding({ buildingId, organizationId });

      if (error) {
        setRooms([]);
        setErrorMessage(error.message || 'Kunde inte hämta rum.');
        setLoading(false);
        return;
      }

      setRooms(data);
      setLoading(false);
    };

    loadRooms();
  }, [buildingId, organizationId]);

  return {
    rooms,
    loading,
    errorMessage,
  };
}
