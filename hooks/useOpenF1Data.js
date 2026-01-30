// hooks/useOpenF1Data.js 
import { useState, useEffect } from 'react';
import { OpenF1Client } from '../lib/openf1/client';

export function useOpenF1Data(endpoint, params = {}, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await OpenF1Client.fetchWithCache(endpoint, params);
        setData(result);
      } catch (err) {
        setError(err.message);
        console.error(`useOpenF1Data error (${endpoint}):`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, JSON.stringify(params), ...dependencies]);

  return { data, loading, error };
}

export function useFerrariData(year = 2024) {
  const { data: drivers, loading, error } = useOpenF1Data('drivers', {
    team_name: 'Ferrari',
    year
  });

  const ferrariData = drivers ? {
    drivers,
    leclerc: drivers.find(d => d.driver_number === 16),
    sainz: drivers.find(d => d.driver_number === 55),
    count: drivers.length
  } : null;

  return { data: ferrariData, loading, error };
}
