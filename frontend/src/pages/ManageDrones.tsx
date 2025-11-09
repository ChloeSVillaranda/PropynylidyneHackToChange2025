import { useState, useEffect } from 'react';
import { Box, Card, Typography, IconButton, Chip, useTheme } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { droneService } from '../api';
import { Drone } from '../types';
import DroneModal from '../components/DroneModal';
import CreateDroneModal from '../components/CreateDroneModal';

function ManageDrones() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [drones, setDrones] = useState<Drone[]>([]);
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
        setDrones([]);
        return;
      }
      
      setDrones(fetchedDrones);
      console.log('Drones state updated, count:', fetchedDrones.length);
    } catch (err) {
      setError((err as Error)?.message || 'Failed to fetch drones');
      console.error('Error fetching drones:', err);
      setDrones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDrone = (drone: Drone) => {
    setSelectedDrone(drone);
    setIsViewModalOpen(true);
  };

  const handleCreateDrone = async (droneData: any) => {
    setLoading(true);
    setError('');
    try {
      console.log('Creating drone with data:', droneData);
      const newDrone = await droneService.createDrone(droneData);
      console.log('Drone created successfully:', newDrone);
      
      setDrones([...drones, newDrone]);
      setIsCreateModalOpen(false);
      alert('Drone created successfully!');
      
      // Refresh the list to get the latest from backend
      await fetchAllDrones();
    } catch (err) {
      setError((err as Error)?.message || 'Failed to create drone');
      console.error('Error creating drone:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDrone = async (updatedDrone: Drone) => {
    setLoading(true);
    setError('');
    try {
      const updateData = {
        model: updatedDrone.model,
        status: updatedDrone.status,
        currentLocation: updatedDrone.currentLocation,
        metadata: updatedDrone.metadata,
        lastMaintenance: updatedDrone.lastMaintenance,
        lastImageTimestamp: updatedDrone.lastImageTimestamp
      };
      
      console.log('Updating drone:', updatedDrone.droneId, updateData);
      
      const result = await droneService.updateDrone(updatedDrone.droneId, updateData);
      console.log('Drone updated successfully:', result);
      
      // Refresh the list from backend
      await fetchAllDrones();
      
      setIsViewModalOpen(false);
      setSelectedDrone(null);
      alert('Drone updated successfully!');
    } catch (err) {
      setError((err as Error)?.message || 'Failed to update drone');
      console.error('Error updating drone:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDrone = async (droneId: string) => {
    if (!confirm(`Are you sure you want to delete drone ${droneId}?`)) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log('Deleting drone:', droneId);
      await droneService.deleteDrone(droneId);
      console.log('Drone deleted successfully');
      
      const updatedDrones = drones.filter(d => d.droneId !== droneId);
      setDrones(updatedDrones);
      alert('Drone deleted successfully!');
    } catch (err) {
      setError((err as Error)?.message || 'Failed to delete drone');
      console.error('Error deleting drone:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderDroneCard = (drone: Drone) => {
    const statusColors = {
      Available: { background: "#4CAF50", color: "white" },
      Busy: { background: "#FF9800", color: "white" },
      Maintenance: { background: "#f44336", color: "white" }
    };

    const colorStyles = statusColors[drone.status as keyof typeof statusColors] ?? {
      background: "#9e9e9e",
      color: "white"
    };

    return (
      <Card
        key={drone.droneId}
        sx={{
          p: 3,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
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
        {/* Action Icons */}
        <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 0.5 }}>
          <IconButton
            onClick={() => handleViewDrone(drone)}
            size="small"
            sx={{
              color: isDark ? '#60a5fa' : '#3b82f6',
              '&:hover': { bgcolor: isDark ? 'rgba(96,165,250,0.1)' : 'rgba(59,130,246,0.1)' }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteDrone(drone.droneId)}
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

        {/* Drone Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ 
            color: isDark ? 'white' : '#1e293b', 
            fontWeight: 700,
            mb: 0.5
          }}>
            {drone.model}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
              fontSize: '0.875rem'
            }}
          >
            ID: {drone.droneId}
          </Typography>
        </Box>

        {/* Drone Details */}
        <Box sx={{ flex: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <BatteryFullIcon sx={{ color: isDark ? '#94a3b8' : '#475569' }} />
            <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#475569' }}>
              Battery: {drone.metadata?.batteryLevel ?? 0}%
            </Typography>
          </Box>
          {drone.currentLocation && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon sx={{ color: isDark ? '#94a3b8' : '#475569' }} />
              <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#475569' }}>
                {drone.currentLocation.latitude.toFixed(4)}, {drone.currentLocation.longitude.toFixed(4)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Drone Status */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mt: 'auto', 
          pt: 2,
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`
        }}>
          <Chip
            label={drone.status}
            size="small"
            sx={{
              bgcolor: colorStyles.background,
              color: colorStyles.color,
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px'
            }}
          />
        </Box>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="overline" 
          sx={{ 
            color: '#9e9e9e',
            letterSpacing: '0.2rem',
            display: 'block',
            mb: 1
          }}
        >
          Operations
        </Typography>
        <Typography variant="h4" sx={{ mb: 1 }}>Manage Drones</Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          Review, create, and update drone fleet.
        </Typography>
      </Box>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#ffebee', color: '#c62828', marginBottom: '1rem', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          disabled={loading}
          style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          Create New Drone
        </button>
      </div>

      {loading && drones.length === 0 ? (
        <p>Loading drones...</p>
      ) : drones.length === 0 ? (
        <p style={{ color: '#666' }}>No drones available. Click "Create New Drone" to add one.</p>
      ) : (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {drones.map(renderDroneCard)}
        </Box>
      )}

      {isCreateModalOpen && (
        <CreateDroneModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateDrone}
          loading={loading}
        />
      )}

      {isViewModalOpen && selectedDrone && (
        <DroneModal
          drone={selectedDrone}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedDrone(null);
          }}
          onUpdate={handleUpdateDrone}
          loading={loading}
        />
      )}
    </Box>
  );
}

export default ManageDrones;
