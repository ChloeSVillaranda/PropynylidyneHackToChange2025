import { useState, useEffect } from 'react';
import { Mission } from '../types';

interface MissionDetailsModalProps {
  mission: Mission;
  onClose: () => void;
  onUpdate: (mission: Mission) => void;
  loading: boolean;
}

function toInputDateTime(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  // local datetime-local expects yyyy-MM-ddTHH:mm (no seconds, no Z)
  const tzOffset = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - tzOffset);
  return local.toISOString().slice(0, 16);
}

function fromInputDateTime(value: string | undefined) {
  if (!value) return undefined;
  // Assume input like '2025-11-08T10:00' (local) -> convert to ISO with Z
  const dt = new Date(value);
  if (isNaN(dt.getTime())) return undefined;
  return dt.toISOString();
}

function MissionDetailsModal({ mission, onClose, onUpdate, loading }: MissionDetailsModalProps) {
  const [formData, setFormData] = useState<Mission>(() => ({
    droneId: mission.droneId,
    startTime: mission.startTime,
    endTime: mission.endTime,
    route: mission.route ?? [],
    missionType: mission.missionType,
    // ...keep other optional fields if present
    ...(mission as any)
  }));

  const [newWaypoint, setNewWaypoint] = useState({ latitude: 0, longitude: 0 });

  useEffect(() => {
    setFormData({
      droneId: mission.droneId,
      startTime: mission.startTime,
      endTime: mission.endTime,
      route: mission.route ?? [],
      missionType: mission.missionType,
      ...(mission as any)
    });
  }, [mission]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }) as Mission);
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = fromInputDateTime(e.target.value);
    setFormData(prev => ({ ...prev, startTime: val }));
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = fromInputDateTime(e.target.value);
    setFormData(prev => ({ ...prev, endTime: val }));
  };

  const handleAddWaypoint = () => {
    const lat = Number(newWaypoint.latitude);
    const lng = Number(newWaypoint.longitude);
    if (isNaN(lat) || isNaN(lng)) return;
    setFormData(prev => ({
      ...prev,
      route: [...(prev.route || []), { latitude: lat, longitude: lng }]
    }));
    setNewWaypoint({ latitude: 0, longitude: 0 });
  };

  const handleRemoveWaypoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      route: prev.route?.filter((_, i) => i !== index) ?? []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure route items are numbers
    const safeRoute = (formData.route || []).map(r => ({ latitude: Number(r.latitude), longitude: Number(r.longitude) }));
    const payload: Mission = {
      ...formData,
      route: safeRoute
    };
    onUpdate(payload);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{ backgroundColor: 'white', borderRadius: 8, padding: '1.5rem', maxWidth: 640, width: '95%', maxHeight: '90vh', overflow: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Edit Mission</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20 }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>Drone ID</label>
            <input type="text" name="droneId" value={formData.droneId} disabled style={{ width: '100%', padding: 8 }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>Mission Type</label>
            <select name="missionType" value={formData.missionType || ''} onChange={handleChange} style={{ width: '100%', padding: 8 }}>
              <option value="">Select Type</option>
              <option value="Patrol">Patrol</option>
              <option value="Emergency">Emergency</option>
              <option value="Delivery">Delivery</option>
              <option value="Survey">Survey</option>
              <option value="Inspection">Inspection</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>Start Time</label>
            <input
              type="datetime-local"
              name="startTime"
              value={toInputDateTime(formData.startTime)}
              onChange={handleStartTimeChange}
              style={{ width: '100%', padding: 8 }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>End Time</label>
            <input
              type="datetime-local"
              name="endTime"
              value={toInputDateTime(formData.endTime)}
              onChange={handleEndTimeChange}
              style={{ width: '100%', padding: 8 }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>Route Waypoints</label>
            <div style={{ border: '1px solid #ccc', borderRadius: 6, padding: 8, maxHeight: 200, overflow: 'auto' }}>
              {(formData.route || []).length === 0 ? (
                <p style={{ margin: 0, color: '#666' }}>No waypoints</p>
              ) : (
                (formData.route || []).map((wp, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #eee' }}>
                    <span>{idx + 1}. Lat: {Number(wp.latitude).toFixed(4)}, Lng: {Number(wp.longitude).toFixed(4)}</span>
                    <button type="button" onClick={() => handleRemoveWaypoint(idx)} style={{ background: 'none', border: 'none', color: '#f44336', fontSize: 18 }}>×</button>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginTop: 8 }}>
              <input type="number" step="any" placeholder="Latitude" value={newWaypoint.latitude || ''} onChange={e => setNewWaypoint(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))} style={{ padding: 8 }} />
              <input type="number" step="any" placeholder="Longitude" value={newWaypoint.longitude || ''} onChange={e => setNewWaypoint(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))} style={{ padding: 8 }} />
              <button type="button" onClick={handleAddWaypoint} style={{ padding: '8px 12px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: 4 }}>Add</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 12px', backgroundColor: '#e0e0e0', border: 'none', borderRadius: 4 }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '8px 12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: 4 }}>{loading ? 'Updating...' : 'Update Mission'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MissionDetailsModal;
