import { useState, useEffect } from 'react';
import { droneService } from '../api';
import { Drone } from '../types';
import DroneModal from '../components/DroneModal';
import CreateDroneModal from '../components/CreateDroneModal';

function ManageDrones() {
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
      // Uncomment when backend is ready
      // const newDrone = await droneService.createDrone(droneData);
      
      // Mock data for now
      const newDrone: Drone = {
        ...droneData,
        entityType: 'DRONE',
      };
      
      setDrones([...drones, newDrone]);
      setIsCreateModalOpen(false);
      alert('Drone created successfully!');
    } catch (err) {
      setError('Failed to create drone');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDrone = async (updatedDrone: Drone) => {
    setLoading(true);
    setError('');
    try {
      // Uncomment when backend is ready
      // await droneService.updateDrone(updatedDrone.droneId, updatedDrone);
      
      // Mock update for now
      const updatedDrones = drones.map(d => 
        d.droneId === updatedDrone.droneId ? updatedDrone : d
      );
      
      setDrones(updatedDrones);
      setIsViewModalOpen(false);
      setSelectedDrone(null);
      alert('Drone updated successfully!');
    } catch (err) {
      setError('Failed to update drone');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return '#4CAF50';
      case 'Busy': return '#FF9800';
      case 'Maintenance': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Manage Drones</h2>
      
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
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {drones.map((drone) => (
            <div 
              key={drone.droneId}
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '1rem',
                backgroundColor: '#f9f9f9'
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0' }}>{drone.droneId}</h4>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                <strong>Model:</strong> {drone.model}
              </p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong>Status:</strong> 
                <span style={{ 
                  display: 'inline-block',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: getStatusColor(drone.status),
                  color: 'white',
                  fontSize: '0.8rem'
                }}>
                  {drone.status}
                </span>
              </p>
              {drone.metadata && (
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                  <strong>Battery:</strong> {drone.metadata.batteryLevel}%
                </p>
              )}
              {drone.currentLocation && (
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                  <strong>Location:</strong> {drone.currentLocation.latitude.toFixed(4)}, {drone.currentLocation.longitude.toFixed(4)}
                </p>
              )}
              <button
                onClick={() => handleViewDrone(drone)}
                style={{ 
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#2196F3', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                View & Edit
              </button>
            </div>
          ))}
        </div>
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
    </div>
  );
}

export default ManageDrones;
