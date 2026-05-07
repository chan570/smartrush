import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Store Icon (Brighter & More Visible)
const storeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3710/3710274.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
  className: 'live-marker'
});

// User Location Icon (Distinct Blue Pin)
const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', 
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const partnerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2950/2950587.png', // Premium Golden Shop Icon
  iconSize: [45, 45],
  iconAnchor: [22, 45],
  popupAnchor: [0, -45],
  className: 'partner-marker'
});

const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);
  return null;
};

const MapView = ({ stores, userLocation, onStoreSelect, urgency }) => {
  const center = userLocation ? [userLocation.lat, userLocation.lng] : [12.9716, 77.5946];

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {stores.map((store) => {
        const storeLat = store.lat || (store.location && store.location.lat);
        const storeLng = store.lng || (store.location && store.location.lng);

        if (!storeLat || !storeLng) return null;

        return (
          <Marker 
            key={store._id} 
            position={[storeLat, storeLng]}
            icon={store.priority === 0 ? partnerIcon : storeIcon}
            eventHandlers={{
              click: () => onStoreSelect(store),
            }}
          >
            <Popup>
              <div style={{ color: 'var(--text-main)' }}>
                <strong>{store.name}</strong><br />
                {store.brand}
                {store.isRealTime && <p style={{ fontSize: '10px', color: 'var(--primary)', marginTop: '4px' }}>Discovered Store</p>}
              </div>
            </Popup>
          </Marker>
        );
      })}

      <ChangeView center={center} />
    </MapContainer>
  );
};

export default MapView;
