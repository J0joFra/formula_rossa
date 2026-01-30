// hooks/useFerrariData.js
import { useState, useEffect } from 'react';
import { OpenF1Client } from '../lib/openf1/client';

export function useFerrariData(sessionKey, interval = 10000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const client = new OpenF1Client();

  const fetchData = async () => {
    if (!sessionKey) return;
    
    setLoading(true);
    try {
      const [carData, weather, drivers] = await Promise.all([
        client.getCarData(16, sessionKey).catch(() => null),
        client.getWeather(sessionKey).catch(() => null),
        client.getDrivers(sessionKey).catch(() => null)
      ]);

      setData({ carData, weather, drivers });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if (interval) {
      const id = setInterval(fetchData, interval);
      return () => clearInterval(id);
    }
  }, [sessionKey, interval]);

  return { data, loading, error, refresh: fetchData };
}