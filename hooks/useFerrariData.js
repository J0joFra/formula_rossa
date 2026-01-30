// hooks/useFerrariData.js
import { useState, useEffect, useCallback } from 'react';
import { OpenF1Client } from '../lib/openf1/client';

export function useFerrariData(sessionKey, interval = 10000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const client = new OpenF1Client();

  const fetchData = useCallback(async () => {
    if (!sessionKey) return;
    
    setLoading(true);
    try {
      // Fetch multiple data sources in parallel
      const [
        carData16,
        carData55,
        weatherData,
        driversData,
        championshipDrivers,
        championshipTeam
      ] = await Promise.all([
        client.getCarData(16, sessionKey).catch(() => null),
        client.getCarData(55, sessionKey).catch(() => null),
        client.getWeather(sessionKey).catch(() => null),
        client.getDrivers(sessionKey).catch(() => null),
        client.getDriversChampionship(sessionKey, [16, 55]).catch(() => []),
        client.getTeamsChampionship(sessionKey, 'Ferrari').catch(() => [])
      ]);

      setData({
        carData: [...(carData16 || []), ...(carData55 || [])],
        weather: weatherData || [],
        drivers: driversData || [],
        championship: {
          drivers: championshipDrivers,
          team: championshipTeam?.[0] || null
        },
        timestamp: new Date().toISOString()
      });
      
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching Ferrari data:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionKey]);

  useEffect(() => {
    fetchData();
    
    if (interval) {
      const id = setInterval(fetchData, interval);
      return () => clearInterval(id);
    }
  }, [fetchData, interval]);

  return { 
    data, 
    loading, 
    error, 
    refresh: fetchData,
    // Helper functions
    getDriverData: (driverNumber) => {
      if (!data?.carData) return null;
      return data.carData.filter(d => d.driver_number === driverNumber);
    },
    getLatestWeather: () => {
      if (!data?.weather || data.weather.length === 0) return null;
      return data.weather[data.weather.length - 1];
    },
    getChampionshipInfo: () => data?.championship || null
  };
}