import { httpClient } from '@/shared/api/httpClient';
import type { CreateSupervisorDTO, Supervisor } from '../model/supervisores.types';

/**
 * Servicio API para el dominio de Supervisores.
 * Consume los endpoints correspondientes a través del API Gateway (puerto 8084),
 * inyectando de forma automática el Bearer token JWT de Zustand en cada petición.
 */

/**
 * Obtiene el listado completo de supervisores habilitados en el sistema.
 * GET /api/supervisores
 */
export const getSupervisores = async (): Promise<Supervisor[]> => {
  const response = await httpClient.get<Supervisor[]>('/api/users/supervisores');
  return response.data;
};
/**
 * Da de alta un nuevo supervisor registrando únicamente su dirección de correo electrónico.
 * POST /api/supervisores
 */
export const createSupervisor = async (
  data: CreateSupervisorDTO
): Promise<Supervisor> => {
  const response = await httpClient.post<Supervisor>('/api/users/supervisores', data);
  return response.data;
};

export const supervisoresApi = {
  getSupervisores,
  createSupervisor,
};
