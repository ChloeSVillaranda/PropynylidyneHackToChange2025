import { CreateMissionRequest, Mission, UpdateMissionRequest } from '../types';
import { apiConfig, getAuthHeaders } from './config';

export const missionService = {
  getAllMissions: async (): Promise<Mission[]> => {
    const res = await fetch(`${apiConfig.baseURL}/missions`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch missions');
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
  },

  getMissionById: async (missionId: string): Promise<Mission> => {
    const res = await fetch(`${apiConfig.baseURL}/missions/${missionId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Mission not found: ${missionId}`);
    const data = await res.json();
    return data.data || data;
  },

  createMission: async (missionData: CreateMissionRequest): Promise<Mission> => {
    const payload = {
      droneId: missionData.droneId,
      missionType: missionData.missionType,
      startTime: missionData.startTime,
      endTime: missionData.endTime,
      route: (missionData.route || []).map(p => ({
        latitude: Number(p.latitude),
        longitude: Number(p.longitude)
      })),
      ...(missionData.metadata && { metadata: missionData.metadata })
    };

    const res = await fetch(`${apiConfig.baseURL}/missions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Create mission failed:', res.status, text);
      throw new Error(`Failed to create mission: ${res.statusText}`);
    }

    const data = await res.json();
    return data.data || data;
  },

  updateMission: async (missionId: string, missionData: UpdateMissionRequest): Promise<Mission> => {
    const res = await fetch(`${apiConfig.baseURL}/missions/${missionId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(missionData),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Update mission failed:', res.status, text);
      throw new Error(`Failed to update mission: ${res.statusText}`);
    }

    const data = await res.json();
    return data.data || data;
  },

  deleteMission: async (missionId: string): Promise<void> => {
    const res = await fetch(`${apiConfig.baseURL}/missions/${missionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('Delete mission failed:', res.status, text);
      throw new Error(`Failed to delete mission: ${res.statusText}`);
    }
  },
};
