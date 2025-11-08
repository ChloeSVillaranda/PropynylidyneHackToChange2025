import {useState, useEffect} from 'react';
import {MapContainer, TileLayer, Marker, Popup, Polyline} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import droneIconImg from '../assets/drone.png';
import patrolIconImg from '../assets/drone-blue.png';

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

const patrolDroneIcon = new L.Icon({
    iconUrl: patrolIconImg,
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

    //initializing free roaming and patrol drones inside the bounds
    const [drones, setDrones] = useState([
        //free roaming drones
        ...Array.from({length: 5}, (_, i) => ({
            id: i + 1,
            type: 'free',
            pos: [
                Math.random() * (bounds.north - bounds.south) + bounds.south,
                Math.random() * (bounds.east - bounds.west) + bounds.west,
            ],
            target: [
                Math.random() * (bounds.north - bounds.south) + bounds.south,
                Math.random() * (bounds.east - bounds.west) + bounds.west,
            ],
        })),

        //patrol drones
        {
            id: 4,
            type: 'patrol',
            pos: [51.1, -114.15],
            route: [
                [51.1, -114.15],
                [51.12, -114.142],
                [51.12, -114.12],
                [51.1, -114.128],
            ],
            routeIndex: 0,
        },
        {
            id: 5,
            type: 'patrol',
            pos: [51.0, -113.98],
            route: [
                [51.0, -113.98],
                [51.02, -113.972],
                [51.02, -113.95],
                [51.0, -113.958],
            ],
            routeIndex: 0,
        },
    ]);

    //moving drones towards a target
    useEffect(() => {
        const interval = setInterval(() => {
            setDrones((prev) =>
                prev.map((drone) => {
                    let [lat, lng] = drone.pos;
                    let tLat, tLng;

                    if (drone.type === 'patrol') {
                        //get current route target
                        const target = drone.route[drone.routeIndex];
                        [tLat, tLng] = target;

                        //check if reached the waypoint
                        const reached =
                            Math.abs(tLat - lat) < 0.0003 &&
                            Math.abs(tLng - lng) < 0.0003;

                        if (reached) {
                            //go to next point (looping)
                            const nextIndex =
                                (drone.routeIndex + 1) % drone.route.length;
                            return {...drone, routeIndex: nextIndex};
                        }
                    } else {
                        //free roaming — random targets
                        [tLat, tLng] = drone.target;
                    }

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
                        drone.type === 'free' &&
                        newLat === tLat &&
                        newLng === tLng
                            ? [
                                  Math.random() *
                                      (bounds.north - bounds.south) +
                                      bounds.south,
                                  Math.random() * (bounds.east - bounds.west) +
                                      bounds.west,
                              ]
                            : drone.target;

                    return {
                        ...drone,
                        pos: [newLat, newLng],
                        target: newTarget,
                    };
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
                            icon={
                                drone.type === 'patrol'
                                    ? patrolDroneIcon
                                    : droneIcon
                            }>
                            <Popup>
                                Drone {drone.id} <br />
                                Type: {drone.type}
                            </Popup>
                        </Marker>
                    ))}

                    {drones
                        .filter((drone) => drone.type === 'patrol')
                        .map((drone) => (
                            <Polyline
                                key={`route-${drone.id}`}
                                positions={drone.route}
                                color='red'
                                weight={3}
                                opacity={0.7}
                            />
                        ))}
                </MapContainer>
            </div>
        </div>
    );
}

export default Dashboard;
