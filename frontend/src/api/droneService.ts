import { apiConfig, getAuthHeaders } from './config';
import { 
  Drone, 
  CreateDroneRequest, 
  UpdateDroneRequest, 
  DroneResponse, 
  DronesListResponse 
} from '../types';

export const droneService = {
  getAllDrones: async (): Promise<Drone[]> => {
    const response = await fetch(`${apiConfig.baseURL}/drones`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch drones');
    const result: DronesListResponse = await response.json();
    return result.data;
  },

  getDroneById: async (droneId: string): Promise<Drone> => {
    const response = await fetch(`${apiConfig.baseURL}/drones/${droneId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch drone');
    const result: DroneResponse = await response.json();
    return result.data;
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
    const result: DroneResponse = await response.json();
    return result.data;
  },

  updateDrone: async (droneId: string, droneData: UpdateDroneRequest): Promise<Drone> => {
    const response = await fetch(`${apiConfig.baseURL}/drones/${droneId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(droneData),
    });
    if (!response.ok) throw new Error('Failed to update drone');
    const result: DroneResponse = await response.json();
    return result.data;
  },

  deleteDrone: async (droneId: string): Promise<void> => {
    const response = await fetch(`${apiConfig.baseURL}/drones/${droneId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete drone');
  },
};
