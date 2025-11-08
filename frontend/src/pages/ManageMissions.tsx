import { useState, useEffect } from 'react';
import { missionService } from '../api';
import { Mission } from '../types';
import MissionDetailsModal from '../components/MissionDetailsModal';
import CreateMissionModal from '../components/CreateMissionModal';

function ManageMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllMissions();
  }, []);

  const fetchAllMissions = async () => {
    setLoading(true);
    setError('');
    try {
      // Uncomment when backend is ready
      // const fetchedMissions = await missionService.getAllMissions();
      
      // Mock data for now
      const fetchedMissions: Mission[] = [
        {
          droneId: 'drone-001',
          entityType: 'MISSION',
          missionType: 'Patrol',
          startTime: '2025-11-08T10:00:00Z',
          endTime: '2025-11-08T12:00:00Z',
          route: [
            { latitude: 34.0522, longitude: -118.2437 },
            { latitude: 34.0622, longitude: -118.2537 },
            { latitude: 34.0722, longitude: -118.2637 },
          ],
        },
        {
          droneId: 'drone-002',
          entityType: 'MISSION',
          missionType: 'Emergency',
          startTime: '2025-11-08T14:00:00Z',
          route: [
            { latitude: 36.1699, longitude: -115.1398 },
            { latitude: 36.1799, longitude: -115.1498 },
          ],
        },
      ];
      
      setMissions(fetchedMissions);
    } catch (err) {
      setError('Failed to fetch missions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMission = (mission: Mission) => {
    setSelectedMission(mission);
    setIsViewModalOpen(true);
  };

  const handleCreateMission = async (missionData: any) => {
    setLoading(true);
    setError('');
    try {
      // Uncomment when backend is ready
      // const newMission = await missionService.createMission(missionData);
      
      // Mock data for now
      const newMission: Mission = {
        ...missionData,
        entityType: 'MISSION',
      };
      
      setMissions([...missions, newMission]);
      setIsCreateModalOpen(false);
      alert('Mission created successfully!');
    } catch (err) {
      setError('Failed to create mission');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMission = async (updatedMission: Mission) => {
    setLoading(true);
    setError('');
    try {
      // Uncomment when backend is ready
      // await missionService.updateMission(updatedMission.droneId, updatedMission);
      
      // Mock update for now
      const updatedMissions = missions.map(m => 
        m.droneId === updatedMission.droneId ? updatedMission : m
      );
      
      setMissions(updatedMissions);
      setIsViewModalOpen(false);
      setSelectedMission(null);
      alert('Mission updated successfully!');
    } catch (err) {
      setError('Failed to update mission');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMissionTypeColor = (type: string) => {
    switch (type) {
      case 'Patrol': return '#2196F3';
      case 'Emergency': return '#f44336';
      case 'Delivery': return '#FF9800';
      case 'Survey': return '#4CAF50';
      case 'Inspection': return '#9C27B0';
      default: return '#9e9e9e';
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Manage Missions</h2>
      
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
          Create New Mission
        </button>
      </div>

      {loading && missions.length === 0 ? (
        <p>Loading missions...</p>
      ) : missions.length === 0 ? (
        <p style={{ color: '#666' }}>No missions available. Click "Create New Mission" to add one.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {missions.map((mission, index) => (
            <div 
              key={`${mission.droneId}-${index}`}
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '1rem',
                backgroundColor: '#f9f9f9'
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Mission for {mission.droneId}</h4>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong>Type:</strong> 
                <span style={{ 
                  display: 'inline-block',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: getMissionTypeColor(mission.missionType || ''),
                  color: 'white',
                  fontSize: '0.8rem'
                }}>
                  {mission.missionType || 'N/A'}
                </span>
              </p>
              {mission.startTime && (
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                  <strong>Start:</strong> {new Date(mission.startTime).toLocaleString()}
                </p>
              )}
              {mission.endTime && (
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                  <strong>End:</strong> {new Date(mission.endTime).toLocaleString()}
                </p>
              )}
              {mission.route && (
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                  <strong>Waypoints:</strong> {mission.route.length}
                </p>
              )}
              <button
                onClick={() => handleViewMission(mission)}
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
