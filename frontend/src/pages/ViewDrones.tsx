import { useState, useEffect } from 'react';
import { Box, Card, Typography, Chip, useTheme } from "@mui/material";
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { droneService } from '../api';
import { Drone } from '../types';
import DroneModal from '../components/DroneModal';

function ViewDrones() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [drones, setDrones] = useState<Drone[]>([]);
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
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

  const renderDroneCard = (drone: Drone) => {
    const statusColors = {
      Available: { background: "#10b981", color: "white" }, // Softer green
      Busy: { background: "#f97316", color: "white" }, // Softer orange
      Maintenance: { background: "#ef4444", color: "white" } // Softer red
    };

    const colorStyles = statusColors[drone.status as keyof typeof statusColors] ?? {
      background: "#64748b",
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
            ? 'linear-gradient(145deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9))'
            : 'linear-gradient(145deg, #ffffff, #f8fafc)',
          border: 'none',
          borderRadius: '16px',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: isDark 
            ? '0 4px 20px rgba(0,0,0,0.2)'
            : '0 4px 20px rgba(0,0,0,0.05)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: isDark 
              ? '0 8px 25px rgba(0,0,0,0.3)'
              : '0 8px 25px rgba(0,0,0,0.1)'
          }
        }}
      >
        {/* Drone Header - No border bottom */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h6" sx={{ 
            color: isDark ? '#f1f5f9' : '#1e293b', 
            fontWeight: 600,
            fontSize: '1.1rem',
            mb: 0.5
          }}>
            {drone.model}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: isDark ? '#94a3b8' : '#64748b',
              fontSize: '0.875rem'
            }}
          >
            ID: {drone.droneId}
          </Typography>
        </Box>

        {/* Drone Details - Clean spacing */}
        <Box sx={{ flex: 1, mb: 2.5 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            mb: 1.5,
            color: isDark ? '#94a3b8' : '#64748b'
          }}>
            <BatteryFullIcon sx={{ fontSize: '1.2rem' }} />
            <Typography variant="body2">
              Battery: {drone.metadata?.batteryLevel ?? 0}%
            </Typography>
          </Box>
          {drone.currentLocation && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              color: isDark ? '#94a3b8' : '#64748b'
            }}>
              <LocationOnIcon sx={{ fontSize: '1.2rem' }} />
              <Typography variant="body2">
                {drone.currentLocation.latitude.toFixed(4)}, {drone.currentLocation.longitude.toFixed(4)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Status Chip - Cleaner separation */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          pt: 2,
          borderTop: `1px solid ${isDark ? 'rgba(148,163,184,0.1)' : 'rgba(226,232,240,0.6)'}`,
        }}>
          <Chip
            label={drone.status}
            size="small"
            sx={{
              bgcolor: colorStyles.background,
              color: colorStyles.color,
              fontWeight: 500,
              fontSize: '0.75rem',
              height: '24px',
              borderRadius: '12px',
              px: 1
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
          Fleet Status
        </Typography>
        <Typography variant="h4" sx={{ mb: 1 }}>View Drones</Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          Monitor real-time drone locations and status.
        </Typography>
      </Box>

      {/* Error and Loading states */}
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#ffebee', color: '#c62828', marginBottom: '1rem', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {loading && drones.length === 0 ? (
        <p>Loading drones...</p>
      ) : drones.length === 0 ? (
        <p style={{ color: '#666' }}>No drones available.</p>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gap: 2, 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
        }}>
          {drones.map(renderDroneCard)}
        </Box>
      )}

      {isViewModalOpen && selectedDrone && (
        <DroneModal
          drone={selectedDrone}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedDrone(null);
          }}
          onUpdate={() => {}} // No-op, read-only
          loading={false}
          readOnly={true}
        />
      )}
    </Box>
  );
}

export default ViewDrones;
