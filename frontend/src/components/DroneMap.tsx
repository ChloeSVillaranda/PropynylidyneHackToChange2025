import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import droneIconImg from "../assets/drone.png";
import patrolIconImg from "../assets/drone-blue.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { cameraService } from "../api";
import { CameraSnapshot, RoutePoint } from "../types";
import { Drone } from '../types';
import { droneService } from '../api';

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

const cameraMarkerIcon = L.divIcon({
  className: "camera-marker-icon",
  html: `<div class="camera-marker-pin"><span>📷</span></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
});

// droneId: string;
//   model: string;
//   status: DroneStatus;
//   description?: string;
//   currentLocation?: {
//     latitude: number;
//     longitude: number;
//   };
//   lastMaintenance?: string;
//   lastImageTimestamp?: string;
//   metadata?: {
//     firmware?: string;
//     batteryLevel?: number;
//   };

type SimulatedDrone = {
  droneId: string;
  type: "free" | "patrol";
  pos: [number, number];
  target: [number, number];
  route: [number, number][];
  routeIndex: number;
};

export default function DroneMap() {
  const [newDrones, setNewDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllDrones();
  }, []);

  const fetchAllDrones = async () => {
      setLoading(true);
      setError('');
      try {
        const fetchedDrones = await droneService.getAllDrones();
        console.log('Fetched drones from API:', fetchedDrones);
        
        if (!Array.isArray(fetchedDrones)) {
          console.error('Invalid response format:', fetchedDrones);
          setError('Invalid response format from server');
          setNewDrones([]);
          return;
        }
        
        setNewDrones(fetchedDrones);
        console.log('Drones state updated, count:', fetchedDrones.length);
      } catch (err) {
        setError((err as Error)?.message || 'Failed to fetch drones');
        console.error('Error fetching drones:', err);
        setNewDrones([]);
      } finally {
        setLoading(false);
      }
    };
  
  const calgaryCoords: [number, number] = [51.0447, -114.0719];
  const bounds = { north: 51.15, south: 51.0, east: -113.9, west: -114.2 };

  const testpoint: RoutePoint = {
    latitude: 51.1,
    longitude: -114.15,
  };

  const [drones, setDrones] = useState<SimulatedDrone[]>(() => [
    ...Array.from({ length: 5 }, (_, i) => ({
      droneId: String(i + 1),
      type: "free" as const,
      pos: [
        Math.random() * (bounds.north - bounds.south) + bounds.south,
        Math.random() * (bounds.east - bounds.west) + bounds.west,
      ] as [number, number],
      target: [
        Math.random() * (bounds.north - bounds.south) + bounds.south,
        Math.random() * (bounds.east - bounds.west) + bounds.west,
      ] as [number, number],
      route: [],
      routeIndex: 0,
    })),
    {
      droneId: "6",
      type: "patrol",
      pos: [51.1, -114.15] as [number, number],
      route: [
        [testpoint.latitude, testpoint.longitude] as [number, number],
        [51.12, -114.142] as [number, number],
        [51.12, -114.12] as [number, number],
        [51.1, -114.128] as [number, number],
      ],
      routeIndex: 0,
      target: [51.1, -114.15] as [number, number],
    },
    {
      droneId: "7",
      type: "patrol",
      pos: [51.0, -113.9] as [number, number],
      route: [
        [51.0, -113.98] as [number, number],
        [51.02, -113.972] as [number, number],
        [51.02, -113.95] as [number, number],
        [51.0, -113.958] as [number, number],
      ],
      routeIndex: 0,
      target: [51.0, -113.98] as [number, number],
    },
  ]);

  const [cameraSnapshots, setCameraSnapshots] = useState<CameraSnapshot[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setDrones((prev) =>
  //       prev.map((drone) => {
  //         const [lat, lng] = drone.pos;
  //         let tLat: number;
  //         let tLng: number;

  //         if (drone.type === "patrol") {
  //           const target = drone.route[drone.routeIndex];
  //           [tLat, tLng] = target;

  //           const reached =
  //             Math.abs(tLat - lat) < 0.0003 && Math.abs(tLng - lng) < 0.0003;

  //           if (reached) {
  //             const nextIndex = (drone.routeIndex + 1) % drone.route.length;
  //             return { ...drone, routeIndex: nextIndex };
  //           }
  //         } else {
  //           [tLat, tLng] = drone.target;
  //         }

  //         const step = 0.0005;
  //         const newLat =
  //           Math.abs(tLat - lat) < step ? tLat : lat + Math.sign(tLat - lat) * step;
  //         const newLng =
  //           Math.abs(tLng - lng) < step ? tLng : lng + Math.sign(tLng - lng) * step;

  //         const newTarget =
  //           drone.type === "free" && newLat === tLat && newLng === tLng
  //             ? [
  //                 Math.random() * (bounds.north - bounds.south) + bounds.south,
  //                 Math.random() * (bounds.east - bounds.west) + bounds.west,
  //               ]
  //             : drone.target;

  //         return {
  //           ...drone,
  //           pos: [newLat, newLng],
  //           target: newTarget as [number, number],
  //         };
  //       })
  //     );
  //   }, 100);

  //   return () => clearInterval(interval);
  // }, []);

  // useEffect(() => {
  //   let isMounted = true;

  //   const loadSnapshots = async () => {
  //     try {
  //       const snapshots = await cameraService.getCalgarySnapshots();
  //       if (isMounted) {
  //         setCameraSnapshots(snapshots);
  //         setCameraError(null);
  //       }
  //     } catch (error) {
  //       console.error("[DroneMap] Failed to load camera snapshots", error);
  //       if (isMounted) {
  //         setCameraError("Unable to load live camera feeds.");
  //       }
  //     }
  //   };

  //   void loadSnapshots();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, []);

  const validCameraSnapshots = useMemo(
    () =>
      cameraSnapshots.filter(
        (snapshot) =>
          typeof snapshot.latitude === "number" &&
          typeof snapshot.longitude === "number" &&
          snapshot.imageUrl
      ),
    [cameraSnapshots]
  );

  return (
    <MapContainer
      center={calgaryCoords}
      zoom={12}
      scrollWheelZoom
      style={{ width: "100%", height: "650px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {drones.map((drone) => (
        <Marker
          key={drone.droneId}
          position={drone.pos}
          icon={drone.type === "patrol" ? patrolDroneIcon : droneIcon}
        >
          <Popup>
            <strong>Drone {drone.droneId}</strong>
            <br />
            Type: {drone.type}
          </Popup>
        </Marker>
      ))}

      {drones
        .filter((d) => d.type === "patrol")
        .map((d) => (
          <Polyline
            key={`route-${d.droneId}`}
            positions={d.route}
            color="red"
            weight={3}
            opacity={0.7}
          />
        ))}

      {validCameraSnapshots.map((snapshot) => (
        <Marker
          key={`camera-${snapshot.cameraId}-${snapshot.viewId}`}
          position={[snapshot.latitude!, snapshot.longitude!] as [number, number]}
          icon={cameraMarkerIcon}
        >
          <Popup minWidth={260}>
            <div className="camera-popup">
              <p className="camera-popup-title">
                {snapshot.location ?? `Camera ${snapshot.cameraId}`}
              </p>
              {snapshot.direction && (
                <p className="camera-popup-direction">Facing {snapshot.direction}</p>
              )}
              {snapshot.imageUrl ? (
                <img
                  src={snapshot.imageUrl}
                  alt={snapshot.location ?? `Camera ${snapshot.cameraId}`}
                  className="camera-popup-image"
                />
              ) : (
                <p className="camera-popup-placeholder">No image available</p>
              )}
              <p className="camera-popup-meta">
                Updated: {new Date(snapshot.capturedAt).toLocaleString()}
              </p>
              {snapshot.roadway && (
                <p className="camera-popup-roadway">{snapshot.roadway}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {cameraError && (
        <Popup position={calgaryCoords}>
          <p>{cameraError}</p>
        </Popup>
      )}
    </MapContainer>
  );
}

