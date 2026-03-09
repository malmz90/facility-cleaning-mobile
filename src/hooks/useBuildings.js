import { useEffect, useState } from 'react';
import { fetchBuildingsByOrganization } from '../services/owner.service';

export default function useBuildings(organizationId) {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadBuildings = async () => {
      if (!organizationId) {
        setBuildings([]);
        setLoading(false);
        setErrorMessage('');
        return;
      }

      setLoading(true);
      setErrorMessage('');

      const { data, error } = await fetchBuildingsByOrganization(organizationId);

      if (error) {
        setBuildings([]);
        setErrorMessage(error.message || 'Kunde inte hämta byggnader.');
        setLoading(false);
        return;
      }

      setBuildings(data);
      setLoading(false);
    };

    loadBuildings();
  }, [organizationId]);

  return {
    buildings,
    loading,
    errorMessage,
  };
}
