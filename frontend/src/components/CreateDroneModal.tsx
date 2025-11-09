import { useState } from "react";
import type { CSSProperties } from "react";

import { CreateDroneRequest, DroneStatus } from "../types";

interface CreateDroneModalProps {
  onClose: () => void;
  onCreate: (droneData: CreateDroneRequest) => void;
  loading: boolean;
}

type FormState = {
  droneId: string;
  model: string;
  status: DroneStatus;
  description: string;
  latitude: string;
  longitude: string;
  firmware: string;
  batteryLevel: string;
};

const initialState: FormState = {
  droneId: "",
  model: "",
  status: "Available",
  description: "",
  latitude: "",
  longitude: "",
  firmware: "",
  batteryLevel: "100",
};

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

function CreateDroneModal({ onClose, onCreate, loading }: CreateDroneModalProps) {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [error, setError] = useState("");

  const handleChange = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormState(initialState);
    setError("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedDroneId = formState.droneId.trim();
    const trimmedModel = formState.model.trim();

    if (!trimmedDroneId) {
      setError("Drone ID is required.");
      return;
    }

    if (!trimmedModel) {
      setError("Model is required.");
      return;
    }

    const batteryLevel = Number(formState.batteryLevel);
    if (Number.isNaN(batteryLevel) || batteryLevel < 0 || batteryLevel > 100) {
      setError("Battery level must be a number between 0 and 100.");
      return;
    }

    const latitude = formState.latitude.trim();
    const longitude = formState.longitude.trim();

    let parsedLatitude: number | undefined;
    let parsedLongitude: number | undefined;

    if (latitude !== "") {
      const value = Number(latitude);
      if (Number.isNaN(value)) {
        setError("Latitude must be a valid number.");
        return;
      }
      parsedLatitude = value;
    }

    if (longitude !== "") {
      const value = Number(longitude);
      if (Number.isNaN(value)) {
        setError("Longitude must be a valid number.");
        return;
      }
      parsedLongitude = value;
    }

    const payload: CreateDroneRequest = {
      droneId: trimmedDroneId,
      model: trimmedModel,
      status: formState.status,
      description: formState.description.trim() || undefined,
      currentLocation:
        parsedLatitude !== undefined && parsedLongitude !== undefined
          ? {
              latitude: parsedLatitude,
              longitude: parsedLongitude,
            }
          : undefined,
      metadata: {
        firmware: formState.firmware.trim() || undefined,
        batteryLevel,
      },
    };

    onCreate(payload);
    resetForm();
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0 }}>Create New Drone</h2>
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
              <label style={labelStyle} htmlFor="drone-id">
                Drone ID
              </label>
              <input
                id="drone-id"
                type="text"
                value={formState.droneId}
                onChange={(event) => handleChange("droneId", event.target.value)}
                style={inputStyle}
                placeholder="e.g. drone-001"
                required
              />
            </div>

            <div>
              <label style={labelStyle} htmlFor="drone-model">
                Model
              </label>
              <input
                id="drone-model"
                type="text"
                value={formState.model}
                onChange={(event) => handleChange("model", event.target.value)}
                style={inputStyle}
                placeholder="e.g. DJI-M300"
                required
              />
            </div>

            <div>
              <label style={labelStyle} htmlFor="drone-status">
                Status
              </label>
              <select
                id="drone-status"
                value={formState.status}
                onChange={(event) => handleChange("status", event.target.value as DroneStatus)}
                style={inputStyle}
              >
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label style={labelStyle} htmlFor="drone-battery">
                Battery Level (%)
              </label>
              <input
                id="drone-battery"
                type="number"
                min={0}
                max={100}
                value={formState.batteryLevel}
                onChange={(event) => handleChange("batteryLevel", event.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <label style={labelStyle} htmlFor="drone-description">
              Description
            </label>
            <textarea
              id="drone-description"
              value={formState.description}
              onChange={(event) => handleChange("description", event.target.value)}
              style={{ ...inputStyle, minHeight: "120px", fontFamily: "inherit" }}
              placeholder="Brief description of the drone"
            />
          </div>

          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginTop: "1rem" }}>
            <div>
              <label style={labelStyle} htmlFor="drone-latitude">
                Latitude
              </label>
              <input
                id="drone-latitude"
                value={formState.latitude}
                onChange={(event) => handleChange("latitude", event.target.value)}
                style={inputStyle}
                placeholder="e.g. 40.7128"
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="drone-longitude">
                Longitude
              </label>
              <input
                id="drone-longitude"
                value={formState.longitude}
                onChange={(event) => handleChange("longitude", event.target.value)}
                style={inputStyle}
                placeholder="e.g. -74.006"
              />
            </div>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <label style={labelStyle} htmlFor="drone-firmware">
              Firmware Version
            </label>
            <input
              id="drone-firmware"
              type="text"
              value={formState.firmware}
              onChange={(event) => handleChange("firmware", event.target.value)}
              style={inputStyle}
              placeholder="e.g. v1.2.0"
            />
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
              {loading ? "Creating..." : "Create Drone"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateDroneModal;
