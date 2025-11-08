import {MapContainer, TileLayer, useMap, Marker, Popup} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function Dashboard() {
  const calgaryCoords = [51.0447, -114.0719]; 

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Dashboard</h2>
      <div
        style={{
          width: '100%',
          height: '500px', 
        }}
      >
        <MapContainer
          center={calgaryCoords}
          zoom={13}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }} 
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
          <Marker position={calgaryCoords}>
            <Popup>
              Downtown Calgary
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}

export default Dashboard;
