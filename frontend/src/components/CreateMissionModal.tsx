import { CreateMissionRequest } from '../types';
import { useState } from 'react';

interface CreateMissionModalProps {
  onClose: () => void;
  onCreate: (missionData: CreateMissionRequest) => void;
  loading: boolean;
}

function CreateMissionModal({ onClose, onCreate, loading }: CreateMissionModalProps) {
  const [formData, setFormData] = useState<CreateMissionRequest>({
    droneId: '',
    missionType: 'Patrol',
    startTime: '',
    endTime: '',
    route: []
  });
  const [newWaypoint, setNewWaypoint] = useState({ latitude: 0, longitude: 0 });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddWaypoint = () => {
    if (newWaypoint.latitude !== 0 || newWaypoint.longitude !== 0) {
      setFormData(prev => ({
        ...prev,
        route: [...(prev.route || []), newWaypoint]
      }));
      setNewWaypoint({ latitude: 0, longitude: 0 });
    }
  };

  const handleRemoveWaypoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      route: prev.route?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Create New Mission</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Drone ID *
            </label>
            <input
              type="text"
              name="droneId"
              value={formData.droneId}
              onChange={handleChange}
              required
              placeholder="e.g., drone-001"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Mission Type
            </label>
            <select
              name="missionType"
              value={formData.missionType || ''}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            >
              <option value="Patrol">Patrol</option>
              <option value="Emergency">Emergency</option>
              <option value="Data Collection">Data Collection</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Start Time
            </label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              End Time
            </label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Route Waypoints
            </label>
            <div style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '0.5rem', maxHeight: '150px', overflow: 'auto' }}>
              {formData.route && formData.route.length > 0 ? (
                formData.route.map((waypoint, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0', borderBottom: '1px solid #eee' }}>
                    <span style={{ fontSize: '0.9rem' }}>
                      {index + 1}. Lat: {waypoint.latitude.toFixed(4)}, Lng: {waypoint.longitude.toFixed(4)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWaypoint(index)}
                      style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '1.2rem' }}
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>No waypoints added</p>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={newWaypoint.latitude || ''}
                onChange={(e) => setNewWaypoint(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={newWaypoint.longitude || ''}
                onChange={(e) => setNewWaypoint(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <button
                type="button"
                onClick={handleAddWaypoint}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#e0e0e0',
                color: '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
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
              {loading ? 'Creating...' : 'Create Mission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateMissionModal;
