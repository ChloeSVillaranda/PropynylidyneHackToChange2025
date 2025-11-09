import { useEffect, useState } from "react";
import { Box, Card, Typography, IconButton, Chip, useTheme } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
      <Card
        key={`${mission.missionId}-${mission.droneId}`}
        sx={{
          p: 3,
          position: 'relative',
          background: isDark 
            ? 'linear-gradient(145deg, rgba(30,41,59,0.7), rgba(15,23,42,0.8))'
            : 'linear-gradient(145deg, #ffffff, #f8fafc)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
          borderRadius: 2,
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: isDark 
              ? '0 8px 25px rgba(0,0,0,0.4)'
              : '0 8px 25px rgba(0,0,0,0.1)'
          }
        }}
      >
        {/* Action Icons - Now at top right */}
        <Box sx={{ 
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          gap: 0.5
        }}>
          <IconButton
            onClick={() => handleViewMission(mission)}
            size="small"
            sx={{
              color: isDark ? '#60a5fa' : '#3b82f6',
              '&:hover': { bgcolor: isDark ? 'rgba(96,165,250,0.1)' : 'rgba(59,130,246,0.1)' }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteMission(mission)}
            size="small"
            disabled={loading}
            sx={{
              color: isDark ? '#f87171' : '#ef4444',
              '&:hover': { bgcolor: isDark ? 'rgba(248,113,113,0.1)' : 'rgba(239,68,68,0.1)' }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Mission Header */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
            Mission #{mission.missionId}
          </Typography>
          <Typography variant="h6" sx={{ color: isDark ? 'white' : '#1e293b', fontWeight: 600 }}>
            Drone: {mission.droneId}
          </Typography>
        </Box>

        {/* Mission Details */}
        <Box sx={{ mb: 3 }}>
          {mission.startTime && (
            <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#475569', mb: 0.5 }}>
              Start: {new Date(mission.startTime).toLocaleString()}
            </Typography>
          )}
          {mission.endTime && (
            <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#475569', mb: 0.5 }}>
              End: {new Date(mission.endTime).toLocaleString()}
            </Typography>
          )}
          <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#475569' }}>
            Waypoints: {mission.route?.length ?? 0}
          </Typography>
        </Box>

        {/* Mission Type - Now at bottom */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
          <Chip
            label={mission.missionType}
            size="small"
            sx={{
              bgcolor: colorStyles.background,
              color: colorStyles.color,
              fontWeight: 600
            }}
          />
        </Box>
      </Card>
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
