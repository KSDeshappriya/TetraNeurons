import { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface UserLocation {
  lat: number;
  lng: number;
}

const UserLocationMarker: React.FC = () => {
  const [position, setPosition] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPosition({ lat: latitude, lng: longitude });
        setError(null);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access denied by user.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('An unknown error occurred.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Custom icon for user location
  const userIcon = L.divIcon({
    className: 'user-location-icon',
    html: `<div style="
      background-color: #3B82F6; 
      width: 20px; 
      height: 20px; 
      border-radius: 50%; 
      border: 3px solid white; 
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: -5px;
        left: -5px;
        width: 30px;
        height: 30px;
        border: 2px solid #3B82F6;
        border-radius: 50%;
        opacity: 0.3;
        animation: ripple 2s infinite;
      "></div>
    </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  if (error) {
    console.warn('User location error:', error);
    return null;
  }

  if (!position) {
    return null;
  }

  return (
    <>
      <Marker position={[position.lat, position.lng]} icon={userIcon}>
        <Popup>
          <div className="text-sm">
            <h4 className="font-semibold text-blue-600">Your Location</h4>
            <p>Lat: {position.lat.toFixed(6)}</p>
            <p>Lng: {position.lng.toFixed(6)}</p>
          </div>
        </Popup>
      </Marker>
    </>
  );
};

export default UserLocationMarker;