import { isAxiosError } from 'axios';
import { httpClient } from '@/shared/api/httpClient';
import type { CreateDonacionDTO, Donacion, UpdateDonacionDTO } from '../model/types';

export const donacionesApi = {
  getAll: () => httpClient.get<Donacion[]>('/donaciones').then(response => response.data),
  getById: (id: string) => httpClient.get<Donacion>(`/donaciones/${id}`).then(response => response.data),
  create: (dto: CreateDonacionDTO) => httpClient.post('/donaciones', dto),
  update: (id: string, dto: UpdateDonacionDTO) => httpClient.put(`/donaciones/${id}`, dto),
  delete: (id: number) => httpClient.delete(`/donaciones/${id}`),
};

export function errorDonacion(error: unknown, mensaje: string) {
  if (isAxiosError(error)) {
    if (error.response?.status === 403) return 'Tu cuenta no tiene permiso para realizar esta acción.';
    if (error.response?.status === 400 && typeof error.response.data === 'string' && error.response.data.trim()) {
      return error.response.data;
    }
  }
  return mensaje;
}
