import { httpClient } from '@/shared/api/httpClient';
import type { CrearNecesidad, Entidad, Necesidad } from '../model/types';

export interface RegistroEntidad {
  razonSocial: string;
  tipo: string;
  rubro: string;
  cuit: string;
  direccion: {
    calle1: string;
    altura: number;
    sinAltura: boolean;
    ciudadNombre: string;
    provinciaNombre: string;
    paisNombre: string;
    /** Opcionales: ubican a la entidad en el mapa público de entregas. */
    latitud?: number | null;
    longitud?: number | null;
  };
  mediosDeContacto: { medio: 'EMAIL' | 'SMS' | 'WHATSAPP'; valor: string }[];
  medioPredeterminado: { medio: 'EMAIL'; valor: string };
}

export const entidadesApi = {
  registrarConPassword: (datos: RegistroEntidad, password: string) =>
    httpClient.post('/api/auth/registro/entidad', { datos, password }).then(r => r.data),
  registrarConGoogle: (token: string, datos: RegistroEntidad) =>
    httpClient.post<{ token: string; user: { id: string | number; email: string; role: string; name: string; picture?: string } }>(
      '/api/auth/social/google/registro-entidad', { token, datos }).then(r => r.data),
  listar: () => httpClient.get<Entidad[]>('/entidadBeneficiaria').then(r => r.data),
  habilitarAcceso: (entidadId: number, email: string) =>
    httpClient.post('/api/users/entidades', { entidadId, email }),
  misNecesidades: () => httpClient.get<Necesidad[]>('/api/necesidades/me').then(r => r.data),
  necesidadesDe: (id: number) => httpClient.get<Necesidad[]>(`/api/necesidades/entidad/${id}`).then(r => r.data),
  crearNecesidad: (datos: CrearNecesidad) => httpClient.post<Necesidad>('/api/necesidades', { ...datos, entidadBeneficiariaId: 0 }).then(r => r.data),
};
