import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

import { Mission, MissionType } from "../types";

interface MissionDetailsModalProps {
  mission: Mission;
  onClose: () => void;
  onUpdate: (mission: Mission) => void;
  loading: boolean;
}

type RouteDraft = {
  latitude: string;
  longitude: string;
};

type FormState = {
  missionType: MissionType;
  startTime: string;
  endTime: string;
  route: RouteDraft[];
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
  maxWidth: "620px",
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

const toInputValue = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const toIsoString = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

function MissionDetailsModal({ mission, onClose, onUpdate, loading }: MissionDetailsModalProps) {
  const [formState, setFormState] = useState<FormState>({
    missionType: mission.missionType ?? "Patrol",
    startTime: toInputValue(mission.startTime),
    endTime: toInputValue(mission.endTime),
    route: (mission.route ?? []).map((point) => ({
      latitude: String(point.latitude),
      longitude: String(point.longitude),
    })),
  });
  const [error, setError] = useState("");

  useEffect(() => {
    setFormState({
      missionType: mission.missionType ?? "Patrol",
      startTime: toInputValue(mission.startTime),
      endTime: toInputValue(mission.endTime),
      route: (mission.route ?? []).map((point) => ({
        latitude: String(point.latitude),
        longitude: String(point.longitude),
      })),
    });
    setError("");
  }, [mission]);

  const handleRouteChange = (index: number, field: keyof RouteDraft, value: string) => {
    setFormState((prev) => {
      const nextRoute = [...prev.route];
      nextRoute[index] = {
        ...nextRoute[index],
        [field]: value,
      };
      return { ...prev, route: nextRoute };
    });
  };

  const handleAddWaypoint = () => {
    setFormState((prev) => ({
      ...prev,
      route: [...prev.route, { latitude: "", longitude: "" }],
    }));
  };

  const handleRemoveWaypoint = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      route: prev.route.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const parsedRoute = [];
    for (let i = 0; i < formState.route.length; i++) {
      const waypoint = formState.route[i];
      if (waypoint.latitude.trim() === "" || waypoint.longitude.trim() === "") {
        setError(`Waypoint ${i + 1} must include both latitude and longitude.`);
        return;
      }

      const lat = Number(waypoint.latitude);
      const lng = Number(waypoint.longitude);

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        setError(`Waypoint ${i + 1} must contain valid numbers.`);
        return;
      }

      parsedRoute.push({ latitude: lat, longitude: lng });
    }

    const startIso = toIsoString(formState.startTime);
    const endIso = toIsoString(formState.endTime);

    if (startIso && endIso) {
      const startDate = new Date(startIso);
      const endDate = new Date(endIso);
      if (startDate.getTime() > endDate.getTime()) {
        setError("End time must be after start time.");
        return;
      }
    }

    const payload: Mission = {
      ...mission,
      missionType: formState.missionType,
      startTime: startIso,
      endTime: endIso,
      route: parsedRoute,
    };

    setError("");
    onUpdate(payload);
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0 }}>Edit Mission</h2>
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

        <p style={{ marginTop: 0, marginBottom: "1.5rem", color: "#666", fontSize: "0.9rem" }}>
          Update mission timings, type, or adjust the waypoint route.
        </p>

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
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <div>
              <label style={labelStyle}>Drone ID</label>
              <input
                type="text"
                value={mission.droneId}
                disabled
                style={{ ...inputStyle, backgroundColor: "#f5f5f5", color: "#555" }}
              />
            </div>

            <div>
              <label style={labelStyle} htmlFor="mission-type">
                Mission Type
              </label>
              <select
                id="mission-type"
                value={formState.missionType}
                onChange={(event) => setFormState((prev) => ({ ...prev, missionType: event.target.value as MissionType }))}
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
                value={formState.startTime}
                onChange={(event) => setFormState((prev) => ({ ...prev, startTime: event.target.value }))}
                style={inputStyle}
              />
              <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.25rem" }}>
                Times are stored in UTC once saved.
              </p>
            </div>

            <div>
              <label style={labelStyle} htmlFor="mission-end">
                End Time
              </label>
              <input
                id="mission-end"
                type="datetime-local"
                value={formState.endTime}
                onChange={(event) => setFormState((prev) => ({ ...prev, endTime: event.target.value }))}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1rem" }}>Route waypoints</h3>
                <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.25rem" }}>
                  Adjust coordinates as needed or remove a waypoint.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddWaypoint}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  border: "1px solid #2196F3",
                  backgroundColor: "#2196F3",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Add waypoint
              </button>
            </div>

            {formState.route.length === 0 ? (
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
                No waypoints defined for this mission.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {formState.route.map((point, index) => (
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
                        onChange={(event) => handleRouteChange(index, "latitude", event.target.value)}
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
                        onChange={(event) => handleRouteChange(index, "longitude", event.target.value)}
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
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MissionDetailsModal;
