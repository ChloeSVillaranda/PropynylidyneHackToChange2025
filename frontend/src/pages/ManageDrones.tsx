import { useState } from 'react';
import MissionModal from '../components/MissionModal';
import CreateMissionModal from '../components/CreateMissionModal';
import { missionService } from '../api';

interface Mission {
  id: string;
  name: string;
  description: string;
  droneId: string;
  status: string;
  createdAt: string;
}

function ManageDrones() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [missionId, setMissionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateMission = async (missionData: { name: string; description: string }) => {
    setLoading(true);
    setError('');
    try {
      // Mock data for now
      const newMission: Mission = {
        id: Date.now().toString(),
        name: missionData.name,
        description: missionData.description,
        droneId: 'DRONE-001',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      // Uncomment when backend is ready
      // const newMission = await missionService.createMission(missionData);
      
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

  const handleViewMissionById = async () => {
    if (!missionId.trim()) {
      setError('Please enter a mission ID');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      // Mock data for now
      const mission: Mission = {
        id: missionId,
        name: `Mission ${missionId}`,
        description: 'Sample mission description',
        droneId: 'DRONE-001',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      
      // Uncomment when backend is ready
      // const mission = await missionService.getMissionById(missionId);
      
      setSelectedMission(mission);
      setIsModalOpen(true);
    } catch (err) {
      setError('Failed to fetch mission');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMission = (mission: Mission) => {
    setSelectedMission(mission);
    setIsModalOpen(true);
  };

  const handleUpdateMission = async (updatedMission: Mission) => {
    setLoading(true);
    setError('');
    try {
      // Mock update for now
      const updatedMissions = missions.map(m => 
        m.id === updatedMission.id ? updatedMission : m
      );
      
      // Uncomment when backend is ready
      // await missionService.updateMission(updatedMission.id, updatedMission);
      
      setMissions(updatedMissions);
      setIsModalOpen(false);
      setSelectedMission(null);
      alert('Mission updated successfully!');
    } catch (err) {
      setError('Failed to update mission');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMission(null);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Manage Drones & Missions</h2>
      
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#ffebee', color: '#c62828', marginBottom: '1rem', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Enter Mission ID"
            value={missionId}
            onChange={(e) => setMissionId(e.target.value)}
            style={{ 
              padding: '0.75rem', 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              minWidth: '200px'
            }}
          />
          <button 
            onClick={handleViewMissionById}
            disabled={loading}
            style={{ 
              padding: '0.75rem 1.5rem', 
              backgroundColor: '#2196F3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            View Mission by ID
          </button>
        </div>
      </div>

      <div>
        <h3>Missions List</h3>
        {missions.length === 0 ? (
          <p style={{ color: '#666' }}>No missions created yet. Click "Create New Mission" to get started.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {missions.map((mission) => (
              <div 
                key={mission.id}
                style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '8px', 
                  padding: '1rem',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem 0' }}>{mission.name}</h4>
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                  <strong>ID:</strong> {mission.id}
                </p>
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                  <strong>Status:</strong> {mission.status}
                </p>
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                  <strong>Drone:</strong> {mission.droneId}
                </p>
                <button
                  onClick={() => handleViewMission(mission)}
                  style={{ 
                    marginTop: '0.5rem',
                    padding: '0.5rem 1rem', 
                    backgroundColor: '#FF9800', 
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
      </div>

      {isCreateModalOpen && (
        <CreateMissionModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateMission}
          loading={loading}
        />
      )}

      {isModalOpen && selectedMission && (
        <MissionModal
          mission={selectedMission}
          onClose={handleCloseModal}
          onUpdate={handleUpdateMission}
          loading={loading}
        />
      )}
    </div>
  );
}

export default ManageDrones;
