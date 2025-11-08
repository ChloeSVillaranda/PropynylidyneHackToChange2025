import { useState } from 'react';
import { CreateDroneRequest, DroneStatus } from '../types';

interface CreateDroneModalProps {
  onClose: () => void;
  onCreate: (droneData: CreateDroneRequest) => void;
  loading: boolean;
}

function CreateDroneModal({ onClose, onCreate, loading }: CreateDroneModalProps) {
  const [formData, setFormData] = useState<CreateDroneRequest>({
    droneId: '',
    model: '',
    status: 'Available',
    currentLocation: { latitude: 0, longitude: 0 },
    metadata: { firmware: '', batteryLevel: 100 }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationChange = (field: 'latitude' | 'longitude', value: string) => {
    setFormData(prev => ({
      ...prev,
      currentLocation: {
        latitude: field === 'latitude' ? parseFloat(value) : prev.currentLocation?.latitude || 0,
        longitude: field === 'longitude' ? parseFloat(value) : prev.currentLocation?.longitude || 0,
      }
    }));
  };

  const handleMetadataChange = (field: 'firmware' | 'batteryLevel', value: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        firmware: field === 'firmware' ? value : prev.metadata?.firmware || '',
        batteryLevel: field === 'batteryLevel' ? parseInt(value) : prev.metadata?.batteryLevel || 0,
      }
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
          <h2 style={{ margin: 0 }}>Create New Drone</h2>
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
              Model *
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
              placeholder="e.g., DJI-M300"
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
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            >
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Current Location
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={formData.currentLocation?.latitude || ''}
                onChange={(e) => handleLocationChange('latitude', e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={formData.currentLocation?.longitude || ''}
                onChange={(e) => handleLocationChange('longitude', e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Firmware Version
            </label>
            <input
              type="text"
              placeholder="e.g., v1.2.0"
              value={formData.metadata?.firmware || ''}
              onChange={(e) => handleMetadataChange('firmware', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Battery Level (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.metadata?.batteryLevel || ''}
              onChange={(e) => handleMetadataChange('batteryLevel', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
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
              {loading ? 'Creating...' : 'Create Drone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateDroneModal;
