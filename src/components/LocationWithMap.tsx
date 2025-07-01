import React, { useState, useEffect } from 'react';
import LocationSearch from './LocationSearch';
import Map from './Map';

interface LocationWithMapProps {
  initialAddress: string;
  initialLat: number;
  initialLng: number;
  onChange: (address: string, lat: number, lng: number) => void;
}

const LocationWithMap: React.FC<LocationWithMapProps> = ({ initialAddress, initialLat, initialLng, onChange }) => {
  const [address, setAddress] = useState(initialAddress);
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);

  useEffect(() => {
    setAddress(initialAddress);
    setLat(initialLat);
    setLng(initialLng);
    console.log('LocationWithMap: initial props changed', { initialAddress, initialLat, initialLng });
  }, [initialAddress, initialLat, initialLng]);

  useEffect(() => {
    onChange(address, lat, lng);
    console.log('LocationWithMap: internal state changed, calling onChange', { address, lat, lng });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, lat, lng]);

  return (
    <div>
      <LocationSearch
        value={address}
        onSelect={(newAddress, newLat, newLng) => {
          setAddress(newAddress);
          setLat(newLat);
          setLng(newLng);
          console.log('LocationWithMap: received from LocationSearch', { newAddress, newLat, newLng });
        }}
      />
      <Map
        lat={lat}
        lng={lng}
        value={address}
        onChange={(newAddress, newLat, newLng) => {
          setAddress(newAddress);
          setLat(newLat);
          setLng(newLng);
          console.log('LocationWithMap: received from Map', { newAddress, newLat, newLng });
        }}
      />
    </div>
  );
};

export default LocationWithMap; 