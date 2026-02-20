// components/TrackMap.jsx
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function TrackMap({ sessionKey, selectedDriver, liveData }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [driverPosition, setDriverPosition] = useState(null);

  useEffect(() => {
    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://api.maptiler.com/maps/outdoor/style.json?key=YOUR_KEY',
        center: [10.5, 43.7], 
        zoom: 15,
        pitch: 45,
        bearing: -20
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (liveData?.positions?.[selectedDriver]) {
      const pos = liveData.positions[selectedDriver];
      
      if (driverPosition) {
        driverPosition.remove();
      }
      
      const el = document.createElement('div');
      el.className = 'driver-marker';
      el.style.backgroundColor = '#ff0000';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 0 10px rgba(255,0,0,0.5)';

      const marker = new maplibregl.Marker(el)
        .setLngLat([pos.x, pos.y])
        .addTo(map.current);
      
      setDriverPosition(marker);
    }
  }, [liveData, selectedDriver]);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden h-[400px]">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}