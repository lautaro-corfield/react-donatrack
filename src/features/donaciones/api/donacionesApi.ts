import { httpClient } from '@/shared/api/httpClient';
import type {
  CreateDonacionDTO,
  Donacion,
  UpdateDonacionDTO,
} from '../model/types';

/**
 * Servicio API exclusivo para el dominio de Donaciones.
 * Todas las peticiones pasan estrictamente por la instancia global 'httpClient',
 * inyectando de forma transparente el Bearer JWT en Authorization.
 */
export const donacionesApi = {
  /**
   * Obtiene la lista completa de donaciones registradas.
   * GET /api/donaciones
   */
  getAll: async (): Promise<Donacion[]> => {
    const response = await httpClient.get<Donacion[]>('/api/donaciones');
    return response.data;
  },

  /**
   * Obtiene el detalle de una donación por su identificador.
   * GET /api/donaciones/:id
   */
  getById: async (id: string): Promise<Donacion> => {
    const response = await httpClient.get<Donacion>(`/api/donaciones/${id}`);
    return response.data;
  },

  /**
   * Registra una nueva donación en el microservicio correspondiente.
   * POST /api/donaciones
   */
  create: async (dto: CreateDonacionDTO): Promise<Donacion> => {
    const response = await httpClient.post<Donacion>('/api/donaciones', dto);
    return response.data;
  },

  /**
   * Actualiza los datos de una donación existente.
   * PUT /api/donaciones/:id
   */
  update: async (id: string, dto: UpdateDonacionDTO): Promise<Donacion> => {
    const response = await httpClient.put<Donacion>(`/api/donaciones/${id}`, dto);
    return response.data;
  },

  /**
   * Elimina un registro de donación.
   * DELETE /api/donaciones/:id
   */
  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`/api/donaciones/${id}`);
  },
};
