import { useEffect, useState } from "react";

import { missionService } from "../api";
import CreateMissionModal from "../components/CreateMissionModal";
import MissionDetailsModal from "../components/MissionDetailsModal";
import { CreateMissionRequest, Mission } from "../types";

const missionTypeColors: Record<string, { background: string; color: string }> = {
  Patrol: { background: "#2196F3", color: "white" },
  Emergency: { background: "#f44336", color: "white" },
  "Data Collection": { background: "#6A1B9A", color: "white" },
};

function ManageMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetchAllMissions();
  }, []);

  const fetchAllMissions = async () => {
    setLoading(true);
    setError("");
    try {
      const fetchedMissions = await missionService.getAllMissions();

      if (!Array.isArray(fetchedMissions)) {
        setError("Invalid response format from server");
        setMissions([]);
        return;
      }

      setMissions(fetchedMissions);
    } catch (err) {
      setError((err as Error)?.message || "Failed to fetch missions");
      setMissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMission = (mission: Mission) => {
    setSelectedMission(mission);
    setIsViewModalOpen(true);
  };

  const handleCreateMission = async (missionData: CreateMissionRequest) => {
    setLoading(true);
    setError("");
    try {
      await missionService.createMission(missionData);
      await fetchAllMissions();
      setIsCreateModalOpen(false);
    } catch (err) {
      setError((err as Error)?.message || "Failed to create mission");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMission = async (updatedMission: Mission) => {
    if (!updatedMission.missionId) {
      setError("Mission ID is missing; unable to update.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await missionService.updateMission(String(updatedMission.missionId), {
        startTime: updatedMission.startTime,
        endTime: updatedMission.endTime,
        missionType: updatedMission.missionType,
        route: updatedMission.route,
      });

      await fetchAllMissions();
      setIsViewModalOpen(false);
      setSelectedMission(null);
    } catch (err) {
      setError((err as Error)?.message || "Failed to update mission");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMission = async (mission: Mission) => {
    if (!mission.missionId) {
      setError("Mission ID is missing; unable to delete.");
      return;
    }

    if (!confirm(`Delete mission ${mission.missionId} for drone ${mission.droneId}?`)) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await missionService.deleteMission(String(mission.missionId));
      setMissions((prev) => prev.filter((entry) => entry.missionId !== mission.missionId));
    } catch (err) {
      setError((err as Error)?.message || "Failed to delete mission");
    } finally {
      setLoading(false);
    }
  };

  const renderMissionCard = (mission: Mission) => {
    const colorStyles = missionTypeColors[mission.missionType ?? ""] ?? {
      background: "#607D8B",
      color: "white",
    };

    return (
      <div
        key={`${mission.missionId}-${mission.droneId}`}
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1rem",
          backgroundColor: "#f9f9f9",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h4 style={{ margin: 0 }}>Mission #{mission.missionId}</h4>
            <p style={{ margin: "0.25rem 0", color: "#666", fontSize: "0.9rem" }}>
              Drone: <strong>{mission.droneId}</strong>
            </p>
          </div>
          <span
            style={{
              padding: "0.25rem 0.75rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 600,
              backgroundColor: colorStyles.background,
              color: colorStyles.color,
            }}
          >
            {mission.missionType ?? "Unassigned"}
          </span>
        </div>

        <div style={{ display: "grid", gap: "0.5rem" }}>
          {mission.startTime && (
            <div style={{ fontSize: "0.9rem", color: "#555" }}>
              <strong>Start:</strong> {new Date(mission.startTime).toLocaleString()}
            </div>
          )}
          {mission.endTime && (
            <div style={{ fontSize: "0.9rem", color: "#555" }}>
              <strong>End:</strong> {new Date(mission.endTime).toLocaleString()}
            </div>
          )}
          <div style={{ fontSize: "0.9rem", color: "#555" }}>
            <strong>Waypoints:</strong> {mission.route?.length ?? 0}
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button
            onClick={() => handleViewMission(mission)}
            style={{
              flex: 1,
              padding: "0.6rem",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#2196F3",
              color: "white",
              cursor: "pointer",
            }}
          >
            View &amp; Edit
          </button>
          <button
            onClick={() => handleDeleteMission(mission)}
            disabled={loading}
            style={{
              padding: "0.6rem 1rem",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#f44336",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          marginBottom: "2rem",
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: "0.8rem", letterSpacing: "0.2rem", textTransform: "uppercase", color: "#9e9e9e" }}>
            Operations
          </p>
          <h2 style={{ margin: "0.3rem 0", fontSize: "2rem" }}>Missions</h2>
          <p style={{ margin: 0, color: "#666" }}>Review, create, and update drone missions.</p>
        </div>
        <div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
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
            Create New Mission
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "6px",
          }}
        >
          {error}
        </div>
      )}

      {loading && missions.length === 0 ? (
        <p style={{ color: "#666" }}>Loading missions...</p>
      ) : missions.length === 0 ? (
        <p style={{ color: "#666" }}>No missions yet. Create one to start tracking drone activity.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {missions.map(renderMissionCard)}
        </div>
      )}

      {isCreateModalOpen && (
        <CreateMissionModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateMission}
          loading={loading}
        />
      )}

      {isViewModalOpen && selectedMission && (
        <MissionDetailsModal
          mission={selectedMission}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedMission(null);
          }}
          onUpdate={handleUpdateMission}
          loading={loading}
        />
      )}
    </div>
  );
}

export default ManageMissions;
