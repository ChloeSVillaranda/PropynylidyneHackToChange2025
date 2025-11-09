import { apiConfig, getAuthHeaders } from './config';
import { 
  Drone, 
  CreateDroneRequest, 
  UpdateDroneRequest
} from '../types';

export const droneService = {
  getAllDrones: async (): Promise<Drone[]> => {
    console.log('[droneService] Fetching drones from:', `${apiConfig.baseURL}/drones`);
    
    const response = await fetch(`${apiConfig.baseURL}/drones`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    console.log('[droneService] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[droneService] Error response:', errorText);
      throw new Error('Failed to fetch drones');
    }
    
    const result = await response.json();
    console.log('[droneService] Raw response:', result);
    
    // Handle both wrapped {data: []} and plain array responses
    if (result && typeof result === 'object' && 'data' in result) {
      console.log('[droneService] Returning wrapped data, length:', result.data?.length);
      return Array.isArray(result.data) ? result.data : [];
    }
    
    console.log('[droneService] Returning plain array, length:', result?.length);
    return Array.isArray(result) ? result : [];
  },

  getDroneById: async (droneId: string): Promise<Drone> => {
    const response = await fetch(`${apiConfig.baseURL}/drones/${droneId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch drone');
    
    const drone: Drone = await response.json();
    return drone;
  },

  createDrone: async (droneData: CreateDroneRequest): Promise<Drone> => {
    const response = await fetch(`${apiConfig.baseURL}/drones`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(droneData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create drone failed:', response.status, errorText);
      throw new Error(`Failed to create drone: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Handle wrapped response {data: {}} or plain object
    if (result && typeof result === 'object' && 'data' in result) {
      return result.data;
    }
    
    return result;
  },

  updateDrone: async (droneId: string, droneData: UpdateDroneRequest): Promise<Drone> => {
    const response = await fetch(`${apiConfig.baseURL}/drones/${droneId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(droneData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update drone failed:', response.status, errorText);
      throw new Error(`Failed to update drone: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Handle wrapped response {data: {}} or plain object
    if (result && typeof result === 'object' && 'data' in result) {
      return result.data;
    }
    
    return result;
  },

  deleteDrone: async (droneId: string): Promise<void> => {
    const response = await fetch(`${apiConfig.baseURL}/drones/${droneId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete drone failed:', response.status, errorText);
      throw new Error(`Failed to delete drone: ${response.statusText}`);
    }
  },
};
