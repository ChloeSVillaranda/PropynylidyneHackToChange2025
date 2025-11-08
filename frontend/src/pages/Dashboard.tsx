import {useState, useEffect} from 'react';
import {MapContainer, TileLayer, useMap, Marker, Popup} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import droneIconImg from '../assets/drone.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const droneIcon = new L.Icon({
    iconUrl: droneIconImg,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
});

function Dashboard() {
    const calgaryCoords = [51.0447, -114.0719];

    //city limits coordinates
    const bounds = {
        north: 51.15,
        south: 51.0,
        east: -113.9,
        west: -114.2,
    };

    //initializing drones with random positions inside the bounds
    const [drones, setDrones] = useState(
        Array.from({length: 5}, (_, i) => ({
            id: i + 1,
            pos: [
                Math.random() * (bounds.north - bounds.south) + bounds.south,
                Math.random() * (bounds.east - bounds.west) + bounds.west,
            ],
            target: [
                Math.random() * (bounds.north - bounds.south) + bounds.south,
                Math.random() * (bounds.east - bounds.west) + bounds.west,
            ],
        })),
    );

    //moving drones towards a target
    useEffect(() => {
        const interval = setInterval(() => {
            setDrones((prev) =>
                prev.map((drone) => {
                    const [lat, lng] = drone.pos;
                    const [tLat, tLng] = drone.target;

                    //move 0.0005 degrees per tick toward target
                    const step = 0.0005;
                    const newLat =
                        Math.abs(tLat - lat) < step
                            ? tLat
                            : lat + Math.sign(tLat - lat) * step;
                    const newLng =
                        Math.abs(tLng - lng) < step
                            ? tLng
                            : lng + Math.sign(tLng - lng) * step;

                    //if reached target, pick a new random target
                    const newTarget =
                        newLat === tLat && newLng === tLng
                            ? [
                                  Math.random() *
                                      (bounds.north - bounds.south) +
                                      bounds.south,
                                  Math.random() * (bounds.east - bounds.west) +
                                      bounds.west,
                              ]
                            : drone.target;

                    return {...drone, pos: [newLat, newLng], target: newTarget};
                }),
            );
        }, 100); //update every 0.1 seconds (100 milliseconds)

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <div
                style={{
                    width: '100%',
                    height: '650px',
                }}>
                <MapContainer
                    center={calgaryCoords}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{width: '100%', height: '100%'}}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    />
                    {drones.map((drone) => (
                        <Marker
                            key={drone.id}
                            position={drone.pos}
                            icon={droneIcon}>
                            <Popup>Drone {drone.id}</Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}

export default Dashboard;
