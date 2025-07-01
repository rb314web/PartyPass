import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../assets/style/Map.scss';

interface MapProps {
  lat: number;
  lng: number;
  zoom?: number;
  value: string; // adres lokalizacji
  onChange: (address: string, lat: number, lng: number) => void;
}

const Map: React.FC<MapProps> = ({ lat, lng, zoom = 13, value, onChange }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: zoom,
        zoomControl: true,
        attributionControl: true
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      const customIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      markerRef.current = marker;
      marker.bindPopup(`Lokalizacja: ${lat.toFixed(6)}, ${lng.toFixed(6)}`).openPopup();
      mapRef.current = map;
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
        let address = '';
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=pl`
          );
          const data = await response.json();
          address = data.display_name || '';
        } catch (err) {
          address = '';
        }
        onChange(address, lat, lng);
        console.log('Map clicked, new location:', { address, lat, lng });
      });
      setTimeout(() => {
        try {
          map.invalidateSize();
        } catch (e) {}
      }, 100);
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], zoom);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
    }
  }, [lat, lng, zoom]);

  return (
    <div className="map-container">
      <div ref={mapContainerRef} className="map-content" />
    </div>
  );
};

export default Map; 