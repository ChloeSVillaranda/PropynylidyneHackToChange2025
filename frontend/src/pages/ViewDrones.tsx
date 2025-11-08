import { useState, useEffect } from 'react';
import { droneService } from '../api';
import { apiConfig } from '../api/config';
import { Drone } from '../types';
import DroneModal from '../components/DroneModal';

function ViewDrones() {
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
      // Uncomment when backend is ready
      // const fetchedDrones = await droneService.getAllDrones();
      
      // Mock data for now
      const fetchedDrones: Drone[] = [
        {
          droneId: 'drone-001',
          entityType: 'DRONE',
          model: 'DJI-M300',
          status: 'Available',
          currentLocation: { latitude: 34.0522, longitude: -118.2437 },
          metadata: { firmware: 'v1.2.0', batteryLevel: 87 },
          lastImageTimestamp: '2025-11-08T20:16:42.395Z',
        },
        {
          droneId: 'drone-002',
          entityType: 'DRONE',
          model: 'Skydio-X2',
          status: 'Maintenance',
          currentLocation: { latitude: 36.1699, longitude: -115.1398 },
          metadata: { firmware: 'v1.1.5', batteryLevel: 45 },
        },
      ];
      
      setDrones(fetchedDrones);
    } catch (err) {
      setError('Failed to fetch drones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDrone = (drone: Drone) => {
    setSelectedDrone(drone);
    setIsViewModalOpen(true);
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

  const testApiCall = async () => {
    console.log('Testing API call to getAllDrones...');
    console.log('API URL:', apiConfig.baseURL);
    try {
      const result = await droneService.getAllDrones();
      console.log('API call SUCCESS:', result);
      console.log('Number of drones:', result.length);
    } catch (err) {
      console.error('API call FAILED:', err);
      console.error('Error details:', err instanceof Error ? err.message : err);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>View Drones</h2>
      
      {/* Debug button */}
      <button
        onClick={testApiCall}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#FF5722',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '1rem'
        }}
      >
        🔧 Test API Call (Check Console)
      </button>
      
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

export default ViewDrones;
