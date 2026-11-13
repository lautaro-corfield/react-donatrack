import type { CrearPersonaHumanaDTO, CrearPersonaJuridicaDTO, Donante, ImportacionResponseDTO } from '../model/types';
import { isAxiosError } from 'axios';
import { httpClient } from '@/shared/api/httpClient';
import type { AltaDonante, DonanteEncontrado, AvisoDonante, DonacionPropia, Mision, RegistroDonanteResponse, ResumenDonante } from '../model/types';

export const donantesApi = {
  getAll: async (): Promise<Donante[]> => {
    const response = await httpClient.get<Donante[]>('/donantes');
    return response.data;
  },

  /**
   * Busca un donante específico por su dirección de email.
   * GET /donantes/{email}
   */
  getByEmail: async (email: string): Promise<Donante> => {
    const response = await httpClient.get<Donante>(
      `/donantes/${encodeURIComponent(email)}`
    );
    return response.data;
  },

  /**
   * Da de alta a un donante de tipo Persona Humana (Física).
   * POST /donantes/humano
   */
  createHumano: async (dto: CrearPersonaHumanaDTO): Promise<Donante> => {
    const response = await httpClient.post<Donante>('/donantes/humano', dto);
    return response.data;
  },

  /**
   * Da de alta a un donante de tipo Persona Jurídica.
   * POST /donantes/juridico
   */
  createJuridico: async (dto: CrearPersonaJuridicaDTO): Promise<Donante> => {
    const response = await httpClient.post<Donante>('/donantes/juridico', dto);
    return response.data;
  },

  /**
   * Actualiza los datos de un donante Persona Humana.
   * PUT /donantes/{email}/humano
   */
  updateHumano: async (
    email: string,
    dto: CrearPersonaHumanaDTO
  ): Promise<Donante> => {
    const response = await httpClient.put<Donante>(
      `/donantes/${encodeURIComponent(email)}/humano`,
      dto
    );
    return response.data;
  },

  /**
   * Actualiza los datos de un donante Persona Jurídica.
   * PUT /donantes/{email}/juridico
   */
  updateJuridico: async (
    email: string,
    dto: CrearPersonaJuridicaDTO
  ): Promise<Donante> => {
    const response = await httpClient.put<Donante>(
      `/donantes/${encodeURIComponent(email)}/juridico`,
      dto
    );
    return response.data;
  },

  /**
   * Da de baja a un donante por su email.
   * DELETE /donantes/{email}
   */
  delete: async (email: string): Promise<void> => {
    await httpClient.delete(`/donantes/${encodeURIComponent(email)}`);
  },

  /**
   * Importa donantes de forma masiva enviando un archivo CSV o Excel.
   * POST /donantes/importar
   */
  importarCSV: async (file: File): Promise<ImportacionResponseDTO> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await httpClient.post<ImportacionResponseDTO>(
      '/donantes/importar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  buscarPorCorreo: (email: string) =>
    httpClient.get<DonanteEncontrado[]>('/donantes/buscar', { params: { email } }).then(r => r.data),
  buscarPorDni: (dni: string) =>
    httpClient.get<DonanteEncontrado[]>('/donantes/dni', { params: { dni } }).then(r => r.data),
  resumen: (signal: AbortSignal) => httpClient.get<ResumenDonante>('/donantes/me', { signal }).then(r => r.data),
  donaciones: (signal: AbortSignal) => httpClient.get<DonacionPropia[]>('/donantes/me/donaciones', { signal }).then(r => r.data),
  avisos: (signal: AbortSignal) => httpClient.get<AvisoDonante[]>('/api/notificaciones/me', { signal }).then(r => r.data),
  misiones: (signal: AbortSignal) => httpClient.get<Mision[]>('/incentivos/misiones', { signal }).then(r => r.data),
  visibilidad: (visible: boolean) => httpClient.put('/donantes/me/insignias', { visible }),
  alta: (tipo: 'humano' | 'juridico', datos: AltaDonante) => httpClient.post(`/donantes/${tipo}`, datos),
  registrarConPassword: (tipo: 'humano' | 'juridico', datos: AltaDonante, password: string) =>
    httpClient.post('/api/auth/registro/donante', { tipo, datos, password }).then(r => r.data),
  registrarPublico: (token: string, tipo: 'humano' | 'juridico', datos: AltaDonante) =>
    httpClient.post<RegistroDonanteResponse>('/api/auth/social/google/registro-donante', { token, tipo, datos }).then(r => r.data),
};

export function errorDonantes(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 403) return 'No tenés permiso para realizar esta acción. Si tu sesión es anterior, volvé a ingresar.';
    if (error.response?.status === 409) return 'Ya hay un donante registrado con ese correo.';
    if (error.response?.status === 400) return 'Revisá los datos ingresados e intentá de nuevo.';
  }
  return 'No pudimos completar la operación. Intentá de nuevo.';
}
