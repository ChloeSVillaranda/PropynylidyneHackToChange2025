import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import droneIconImg from "../assets/drone.png";
import patrolIconImg from "../assets/drone-blue.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { cameraService, droneService } from "../api";
import { CameraSnapshot, Drone } from "../types";

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

export default function DroneMap() {
  const calgaryCoords: [number, number] = [51.0447, -114.0719];

  const [drones, setDrones] = useState<Drone[]>([]);
  const [isLoadingDrones, setIsLoadingDrones] = useState(true);
  const [droneError, setDroneError] = useState<string | null>(null);

  const [cameraSnapshots, setCameraSnapshots] = useState<CameraSnapshot[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDrones = async () => {
      try {
        const fetchedDrones = await droneService.getAllDrones();
        if (!isMounted) {
          return;
        }

        setDrones(fetchedDrones);
        setDroneError(null);
      } catch (error) {
        console.error("[DroneMap] Failed to load drones", error);
        if (isMounted) {
          setDroneError("Unable to load drone positions.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingDrones(false);
        }
      }
    };

    void loadDrones();
    const interval = window.setInterval(() => {
      void loadDrones();
    }, 10000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSnapshots = async () => {
      try {
        const snapshots = await cameraService.getCalgarySnapshots();
        if (isMounted) {
          setCameraSnapshots(snapshots);
          setCameraError(null);
        }
      } catch (error) {
        console.error("[DroneMap] Failed to load camera snapshots", error);
        if (isMounted) {
          setCameraError("Unable to load live camera feeds.");
        }
      }
    };

    void loadSnapshots();

    return () => {
      isMounted = false;
    };
  }, []);

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

      {drones
        .filter(
          (drone) =>
            typeof drone.currentLocation?.latitude === "number" &&
            typeof drone.currentLocation?.longitude === "number"
        )
        .map((drone) => {
          const position = [
            drone.currentLocation!.latitude,
            drone.currentLocation!.longitude,
          ] as [number, number];
          const icon =
            drone.status === "Busy" ? patrolDroneIcon : droneIcon;

          return (
            <Marker key={drone.droneId} position={position} icon={icon}>
              <Popup>
                <strong>{drone.droneId}</strong>
                <br />
                Model: {drone.model}
                <br />
                Status: {drone.status}
                {drone.metadata?.batteryLevel !== undefined && (
                  <>
                    <br />
                    Battery: {drone.metadata.batteryLevel}%
                  </>
                )}
                {drone.lastImageTimestamp && (
                  <>
                    <br />
                    Last Update:{" "}
                    {new Date(drone.lastImageTimestamp).toLocaleString()}
                  </>
                )}
              </Popup>
            </Marker>
          );
        })}

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

      {(cameraError || (droneError && !isLoadingDrones)) && (
        <Popup position={calgaryCoords}>
          <p>{cameraError ?? droneError}</p>
        </Popup>
      )}
    </MapContainer>
  );
}

