import { useEffect, useState } from 'react';

import CreateMissionModal from '../components/CreateMissionModal';
import { Mission } from '../types';
import MissionDetailsModal from '../components/MissionDetailsModal';
import { missionService } from '../api';

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
      const fetchedMissions = await missionService.getAllMissions();
      console.log('Fetched missions from API:', fetchedMissions);
      
      if (!Array.isArray(fetchedMissions)) {
        console.error('Invalid response format:', fetchedMissions);
        setError('Invalid response format from server');
        setMissions([]);
        return;
      }
      
      setMissions(fetchedMissions);
      console.log('Missions state updated, count:', fetchedMissions.length);
    } catch (err) {
      setError((err as Error)?.message || 'Failed to fetch missions');
      console.error('Error fetching missions:', err);
      setMissions([]);
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
    try {
      console.log('Creating mission with form data:', missionData);

      // Just pass the form data to the service; it will transform droneId → assignedDroneId
      const created = await missionService.createMission(missionData);
      console.log('Mission created:', created);

      await fetchAllMissions();
      setIsCreateModalOpen(false);
      alert('Mission created successfully!');
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMission = async (updatedMission: any) => {
    setLoading(true);
    try {
      const payload = {
        startTime: updatedMission.startTime,
        endTime: updatedMission.endTime,
        missionType: updatedMission.missionType,
        route: updatedMission.route.map((p: any) => ({
          latitude: { N: String(p.latitude) },
          longitude: { N: String(p.longitude) },
        })),
      };
      const result = await missionService.updateMission(updatedMission.missionId, payload);
      console.log('Updated mission:', result);
      await fetchAllMissions();
      setIsViewModalOpen(false);
      alert('Mission updated!');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMission = async (droneId: string) => {
    if (!confirm(`Are you sure you want to delete mission for ${droneId}?`)) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log('Deleting mission:', droneId);
      await missionService.deleteMission(droneId);
      console.log('Mission deleted successfully');
      
      const updatedMissions = missions.filter(m => m.droneId !== droneId);
      setMissions(updatedMissions);
      alert('Mission deleted successfully!');
    } catch (err) {
      setError((err as Error)?.message || 'Failed to delete mission');
      console.error('Error deleting mission:', err);
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
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => handleViewMission(mission)}
                  style={{ 
                    flex: 1,
                    padding: '0.5rem 1rem', 
                    backgroundColor: '#2196F3', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer'
                  }}
                >
                  View & Edit
                </button>
                <button
                  onClick={() => handleDeleteMission(mission.droneId)}
                  disabled={loading}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    backgroundColor: '#f44336', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  Delete
                </button>
              </div>
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
