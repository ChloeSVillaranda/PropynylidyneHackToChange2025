import { apiConfig, getAuthHeaders } from './config';
import { 
  Mission, 
  CreateMissionRequest, 
  UpdateMissionRequest, 
  MissionResponse, 
  MissionsListResponse 
} from '../types';

export const missionService = {
  getAllMissions: async (): Promise<Mission[]> => {
    const response = await fetch(`${apiConfig.baseURL}/missions`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch missions');
    const result: MissionsListResponse = await response.json();
    return result.data;
  },

  getMissionById: async (id: string): Promise<Mission> => {
    const response = await fetch(`${apiConfig.baseURL}/missions/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch mission');
    const result: MissionResponse = await response.json();
    return result.data;
  },

  createMission: async (missionData: CreateMissionRequest): Promise<Mission> => {
    const response = await fetch(`${apiConfig.baseURL}/missions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(missionData),
    });
    if (!response.ok) throw new Error('Failed to create mission');
    const result: MissionResponse = await response.json();
    return result.data;
  },

  updateMission: async (id: string, missionData: UpdateMissionRequest): Promise<Mission> => {
    const response = await fetch(`${apiConfig.baseURL}/missions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(missionData),
    });
    if (!response.ok) throw new Error('Failed to update mission');
    const result: MissionResponse = await response.json();
    return result.data;
  },

  deleteMission: async (id: string): Promise<void> => {
    const response = await fetch(`${apiConfig.baseURL}/missions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete mission');
  },
};
