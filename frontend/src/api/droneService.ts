import { apiConfig, getAuthHeaders } from './config';
import { 
  Drone, 
  CreateDroneRequest, 
  UpdateDroneRequest
} from '../types';

export const droneService = {
  getAllDrones: async (): Promise<Drone[]> => {
    const response = await fetch(`${apiConfig.baseURL}/drones`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch drones');
    
    const result = await response.json();
    
    // Handle both wrapped {data: []} and plain array responses
    if (result && typeof result === 'object' && 'data' in result) {
      return Array.isArray(result.data) ? result.data : [];
    }
    
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
      body: JSON.stringify({
        ...droneData,
        entityType: 'DRONE'
      }),
    });
    if (!response.ok) throw new Error('Failed to create drone');
    
    const drone: Drone = await response.json();
    return drone;
  },

  updateDrone: async (droneId: string, droneData: UpdateDroneRequest): Promise<Drone> => {
    const response = await fetch(`${apiConfig.baseURL}/drones/${droneId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(droneData),
    });
    if (!response.ok) throw new Error('Failed to update drone');
    
    const drone: Drone = await response.json();
    return drone;
  },

  deleteDrone: async (droneId: string): Promise<void> => {
    const response = await fetch(`${apiConfig.baseURL}/drones/${droneId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete drone');
  },
};
