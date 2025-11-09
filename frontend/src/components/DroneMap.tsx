import {useState, useEffect} from 'react';
import {MapContainer, TileLayer, Marker, Popup, Polyline} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import droneIconImg from '../assets/drone.png';
import patrolIconImg from '../assets/drone-blue.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { RoutePoint } from '../types/mission';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
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

export default function DroneMap() {
    const calgaryCoords: [number, number] = [51.0447, -114.0719];
    //city limits coordinates
    const bounds = {north: 51.15, south: 51.0, east: -113.9, west: -114.2};

    const testpoint: RoutePoint = {
        latitude: 51.1,
        longitude: -114.15
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
            ] as [number, number],
            target: [
                Math.random() * (bounds.north - bounds.south) + bounds.south,
                Math.random() * (bounds.east - bounds.west) + bounds.west,
            ],
            route: [],
            routeIndex: 0
        })),

        //patrol drones
        {
            id: 6,
            type: 'patrol',
            pos: [51.1, -114.15] as [number, number],
            route: [
                [testpoint.latitude,testpoint.longitude] as [number, number],
                [51.12, -114.142] as [number, number],
                [51.12, -114.12] as [number, number],
                [51.1, -114.128] as [number, number],
            ],
            routeIndex: 0,
            target: [51.1, -114.15]
        },
        {
            id: 7,
            type: 'patrol',
            pos: [51.0, -113.98] as [number, number],
            route: [
                [51.0, -113.98] as [number, number],
                [51.02, -113.972] as [number, number],
                [51.02, -113.95] as [number, number],
                [51.0, -113.958] as [number, number],
            ],
            routeIndex: 0,
            target: [51.0, -113.98]
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
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <MapContainer
            center={calgaryCoords}
            zoom={13}
            scrollWheelZoom={true}
            style={{width: '100%', height: '650px'}}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />

            {drones.map((drone) => (
                <Marker
                    key={drone.id}
                    position={drone.pos}
                    icon={
                        drone.type === 'patrol' ? patrolDroneIcon : droneIcon
                    }>
                    <Popup>
                        Drone {drone.id} <br />
                        Type: {drone.type}
                    </Popup>
                </Marker>
            ))}

            {drones
                .filter((d) => d.type === 'patrol')
                .map((d) => (
                    <Polyline
                        key={`route-${d.id}`}
                        positions={d.route}
                        color='red'
                        weight={3}
                        opacity={0.7}
                    />
                ))}
        </MapContainer>
    );
}
