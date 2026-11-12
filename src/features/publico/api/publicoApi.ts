import { httpClient } from '@/shared/api/httpClient';
import type { DonacionPublica } from '../model/types';

/**
 * Endpoints públicos (sin token) de servicio-donaciones, a través del API Gateway.
 */
export const publicoApi = {
  /** GET /api/publico/donaciones/destacadas — entregadas en los últimos 30 días. */
  destacadas: async (limite = 6): Promise<DonacionPublica[]> => {
    const response = await httpClient.get<DonacionPublica[]>(
      '/api/publico/donaciones/destacadas',
      { params: { limite } }
    );
    return response.data;
  },

  /** GET /api/publico/entregas — entregas con coordenadas para el mapa. */
  entregas: async (): Promise<DonacionPublica[]> => {
    const response = await httpClient.get<DonacionPublica[]>('/api/publico/entregas');
    return response.data;
  },
};
