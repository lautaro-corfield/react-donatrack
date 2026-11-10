import { isAxiosError } from 'axios';
import { httpClient } from '@/shared/api/httpClient';
import type { AltaDonante, DonanteEncontrado, AvisoDonante, DonacionPropia, EntidadDirectorio, Mision, RegistroDonanteResponse, ResumenDonante } from '../model/types';

export const donantesApi = {
  buscarPorCorreo: (email: string) =>
    httpClient.get<DonanteEncontrado[]>('/donantes/buscar', { params: { email } }).then(r => r.data),
  buscarPorDni: (dni: string) =>
    httpClient.get<DonanteEncontrado[]>('/donantes/dni', { params: { dni } }).then(r => r.data),
  resumen: (signal: AbortSignal) => httpClient.get<ResumenDonante>('/donantes/me', { signal }).then(r => r.data),
  donaciones: (signal: AbortSignal) => httpClient.get<DonacionPropia[]>('/donantes/me/donaciones', { signal }).then(r => r.data),
  entidades: (signal: AbortSignal) => httpClient.get<EntidadDirectorio[]>('/donantes/me/entidades', { signal }).then(r => r.data),
  avisos: (signal: AbortSignal) => httpClient.get<AvisoDonante[]>('/api/notificaciones/me', { signal }).then(r => r.data),
  misiones: (signal: AbortSignal) => httpClient.get<Mision[]>('/incentivos/misiones', { signal }).then(r => r.data),
  visibilidad: (visible: boolean) => httpClient.put('/donantes/me/insignias', { visible }),
  alta: (tipo: 'humano' | 'juridico', datos: AltaDonante) => httpClient.post(`/donantes/${tipo}`, datos),
  registrarPublico: (token: string, tipo: 'humano' | 'juridico', datos: AltaDonante) =>
    httpClient.post<RegistroDonanteResponse>('/api/auth/social/google/registro-donante', { token, tipo, datos }).then(r => r.data),
  importar: (archivo: File) => {
    const data = new FormData();
    data.append('file', archivo);
    return httpClient.post<{ success: boolean; message: string }>('/donantes/importar', data, {
      headers: { 'Content-Type': undefined },
      timeout: 180_000,
    }).then(r => r.data);
  },
};

export function errorDonantes(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 403) return 'No tenés permiso para realizar esta acción. Si tu sesión es anterior, volvé a ingresar.';
    if (error.response?.status === 409) return 'Ya hay un donante registrado con ese correo.';
    if (error.response?.status === 400) return 'Revisá los datos ingresados e intentá de nuevo.';
  }
  return 'No pudimos completar la operación. Intentá de nuevo.';
}
