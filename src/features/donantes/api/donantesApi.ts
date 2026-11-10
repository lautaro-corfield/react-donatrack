import { httpClient } from '@/shared/api/httpClient';
import type {
  CrearPersonaHumanaDTO,
  CrearPersonaJuridicaDTO,
  Donante,
  ImportacionResponseDTO,
} from '../model/types';

/**
 * Cliente de API exclusivo para el dominio de Donantes.
 * Enruta a través del API Gateway (puerto 8084) hacia 'servicio-donaciones'.
 */
export const donantesApi = {
  /**
   * Obtiene la lista completa de donantes registrados.
   * GET /donantes
   */
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
};

