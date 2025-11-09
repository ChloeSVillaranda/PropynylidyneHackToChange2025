import { apiConfig, getAuthHeaders } from './config';
import { 
  Mission, 
  CreateMissionRequest, 
  UpdateMissionRequest
} from '../types';

export const missionService = {
  getAllMissions: async (): Promise<Mission[]> => {
    const response = await fetch(`${apiConfig.baseURL}/missions`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch missions');
    
    const result = await response.json();
    
    // Handle both wrapped {data: []} and plain array responses
    if (result && typeof result === 'object' && 'data' in result) {
      return Array.isArray(result.data) ? result.data : [];
    }
    
    return Array.isArray(result) ? result : [];
  },

  getMissionById: async (droneId: string): Promise<Mission> => {
    const response = await fetch(`${apiConfig.baseURL}/missions/${droneId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch mission');
    
    const result = await response.json();
    
    if (result && typeof result === 'object' && 'data' in result) {
      return result.data;
    }
    
    return result;
  },

  createMission: async (missionData: CreateMissionRequest): Promise<Mission> => {
    const response = await fetch(`${apiConfig.baseURL}/missions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...missionData,
        entityType: 'MISSION'
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create mission failed:', response.status, errorText);
      throw new Error(`Failed to create mission: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result && typeof result === 'object' && 'data' in result) {
      return result.data;
    }
    
    return result;
  },

  updateMission: async (droneId: string, missionData: UpdateMissionRequest): Promise<Mission> => {
    const response = await fetch(`${apiConfig.baseURL}/missions/${droneId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(missionData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update mission failed:', response.status, errorText);
      throw new Error(`Failed to update mission: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result && typeof result === 'object' && 'data' in result) {
      return result.data;
    }
    
    return result;
  },

  deleteMission: async (droneId: string): Promise<void> => {
    const response = await fetch(`${apiConfig.baseURL}/missions/${droneId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete mission failed:', response.status, errorText);
      throw new Error(`Failed to delete mission: ${response.statusText}`);
    }
  },
};
