import { CameraSnapshot } from '../types';
import { apiConfig, getAuthHeaders } from './config';

export const cameraService = {
  getCalgarySnapshots: async (): Promise<CameraSnapshot[]> => {
    const res = await fetch(`${apiConfig.baseURL}/cameras/calgary/images`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const message = await res.text();
      console.error('[cameraService] Failed to fetch camera snapshots:', res.status, message);
      throw new Error('Failed to fetch camera snapshots');
    }

    const data = await res.json();
    return Array.isArray(data?.data) ? data.data : [];
  },
};


