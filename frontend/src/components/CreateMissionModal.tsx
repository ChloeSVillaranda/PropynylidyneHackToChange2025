import { useState } from "react";
import type { CSSProperties } from "react";

import { CreateMissionRequest, MissionType } from "../types";

interface CreateMissionModalProps {
  onClose: () => void;
  onCreate: (missionData: CreateMissionRequest) => void;
  loading: boolean;
}

type RouteDraft = {
  latitude: string;
  longitude: string;
};

const missionTypes: MissionType[] = ["Patrol", "Emergency", "Data Collection"];

const modalOverlayStyle: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle: CSSProperties = {
  backgroundColor: "white",
  borderRadius: "8px",
  padding: "2rem",
  maxWidth: "600px",
  width: "90%",
  maxHeight: "90vh",
  overflowY: "auto",
  boxSizing: "border-box",
};

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: "0.5rem",
  fontWeight: 600,
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "0.5rem",
  border: "1px solid #ccc",
  borderRadius: "4px",
  boxSizing: "border-box",
};

const helperTextStyle: CSSProperties = {
  fontSize: "0.8rem",
  color: "#666",
  marginTop: "0.25rem",
};

function CreateMissionModal({ onClose, onCreate, loading }: CreateMissionModalProps) {
  const [droneId, setDroneId] = useState("");
  const [missionType, setMissionType] = useState<MissionType>("Patrol");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [route, setRoute] = useState<RouteDraft[]>([]);
  const [error, setError] = useState("");

  const resetForm = () => {
    setDroneId("");
    setMissionType("Patrol");
    setStartTime("");
    setEndTime("");
    setRoute([]);
    setError("");
  };

  const handleAddWaypoint = () => {
    setRoute((prev) => [...prev, { latitude: "", longitude: "" }]);
  };

  const handleWaypointChange = (index: number, field: keyof RouteDraft, value: string) => {
    setRoute((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return next;
    });
  };

  const handleRemoveWaypoint = (index: number) => {
    setRoute((prev) => prev.filter((_, i) => i !== index));
  };

  const parseIso = (value: string) => {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return undefined;
    }
    return date.toISOString();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!droneId.trim()) {
      setError("Drone ID is required.");
      return;
    }

    const trimmedDroneId = droneId.trim();
    const trimmedRoute = route.map((point) => ({
      latitude: point.latitude.trim(),
      longitude: point.longitude.trim(),
    }));

    const parsedRoute = [];
    for (let i = 0; i < trimmedRoute.length; i++) {
      const { latitude, longitude } = trimmedRoute[i];
      if (latitude === "" || longitude === "") {
        setError(`Waypoint ${i + 1} must include both latitude and longitude.`);
        return;
      }

      const lat = Number(latitude);
      const lng = Number(longitude);

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        setError(`Waypoint ${i + 1} must contain valid numbers.`);
        return;
      }

      parsedRoute.push({ latitude: lat, longitude: lng });
    }

    const startIso = parseIso(startTime);
    const endIso = parseIso(endTime);

    if (startIso && endIso) {
      const startDate = new Date(startIso);
      const endDate = new Date(endIso);

      if (startDate.getTime() > endDate.getTime()) {
        setError("End time must be after start time.");
        return;
      }
    }

    const payload: CreateMissionRequest = {
      droneId: trimmedDroneId,
      missionType,
      startTime: startIso,
      endTime: endIso,
      route: parsedRoute.length > 0 ? parsedRoute : undefined,
    };

    onCreate(payload);
    resetForm();
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0 }}>Create New Mission</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#666",
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem 1rem",
              backgroundColor: "#ffebee",
              color: "#c62828",
              borderRadius: "6px",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            <div>
              <label style={labelStyle} htmlFor="mission-droneId">
                Drone ID
              </label>
              <input
                id="mission-droneId"
                type="text"
                value={droneId}
                onChange={(event) => setDroneId(event.target.value)}
                style={inputStyle}
                placeholder="e.g. drone-001"
                required
              />
            </div>

            <div>
              <label style={labelStyle} htmlFor="mission-type">
                Mission Type
              </label>
              <select
                id="mission-type"
                value={missionType}
                onChange={(event) => setMissionType(event.target.value as MissionType)}
                style={inputStyle}
              >
                {missionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle} htmlFor="mission-start">
                Start Time
              </label>
              <input
                id="mission-start"
                type="datetime-local"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                style={inputStyle}
              />
              <p style={helperTextStyle}>Leave blank to start immediately.</p>
            </div>

            <div>
              <label style={labelStyle} htmlFor="mission-end">
                End Time
              </label>
              <input
                id="mission-end"
                type="datetime-local"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                style={inputStyle}
              />
              <p style={helperTextStyle}>Optional if the mission end time is not known.</p>
            </div>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1rem" }}>Route waypoints</h3>
                <p style={{ ...helperTextStyle, marginTop: "0.25rem" }}>
                  Add latitude and longitude pairs to plot the mission route.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddWaypoint}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  border: "1px solid #4CAF50",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Add waypoint
              </button>
            </div>

            {route.length === 0 ? (
              <p
                style={{
                  border: "1px dashed #ccc",
                  borderRadius: "6px",
                  padding: "1rem",
                  textAlign: "center",
                  fontSize: "0.9rem",
                  color: "#666",
                  backgroundColor: "#fafafa",
                }}
              >
                No waypoints added yet. Use “Add waypoint” to start building the route.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {route.map((point, index) => (
                  <div
                    key={`${index}-${point.latitude}-${point.longitude}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr)) auto",
                      gap: "0.5rem",
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px",
                      padding: "0.75rem",
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <div>
                      <label style={{ ...labelStyle, fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={point.latitude}
                        onChange={(event) => handleWaypointChange(index, "latitude", event.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={point.longitude}
                        onChange={(event) => handleWaypointChange(index, "longitude", event.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveWaypoint(index)}
                        style={{
                          border: "1px solid #d32f2f",
                          backgroundColor: "#d32f2f",
                          color: "white",
                          borderRadius: "4px",
                          padding: "0.45rem 0.9rem",
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "2rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#e0e0e0",
                color: "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Creating..." : "Create Mission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateMissionModal;
