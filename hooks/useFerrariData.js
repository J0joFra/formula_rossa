// hooks/useFerrariData.js
import { useState, useEffect } from 'react';
import { getFerrariData } from '@/lib/openf1/client';

export default function useFerrariData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const result = await getFerrariData();
      setData(result);
      setLoading(false);
    }
    fetchData();
  }, []);

  return { data, loading };
}