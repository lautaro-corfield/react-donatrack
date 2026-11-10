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
  };
  mediosDeContacto: { medio: 'EMAIL' | 'SMS' | 'WHATSAPP'; valor: string }[];
  medioPredeterminado: { medio: 'EMAIL'; valor: string };
}

export const entidadesApi = {
  registrarConGoogle: (token: string, datos: RegistroEntidad) =>
    httpClient.post<{ token: string; user: { id: string | number; email: string; role: string; name: string; picture?: string } }>(
      '/api/auth/social/google/registro-entidad', { token, datos }).then(r => r.data),
  listar: () => httpClient.get<Entidad[]>('/entidadBeneficiaria').then(r => r.data),
  habilitarAcceso: (entidadId: number, email: string) =>
    httpClient.post('/api/users/entidades', { entidadId, email }),
  misNecesidades: () => httpClient.get<Necesidad[]>('/api/necesidades/me').then(r => r.data),
  necesidadesDe: (id: number) => httpClient.get<Necesidad[]>(`/api/necesidades/entidad/${id}`).then(r => r.data),
  crearNecesidad: (datos: CrearNecesidad) => httpClient.post<Necesidad>('/api/necesidades/me', { ...datos, entidadBeneficiariaId: 0 }).then(r => r.data),
};
