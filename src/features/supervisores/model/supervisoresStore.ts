import { create } from 'zustand';
import { supervisoresApi } from '../api/supervisores.api';
import type { CreateSupervisorDTO, SupervisoresState } from './supervisores.types';

export const useSupervisoresStore = create<SupervisoresState>((set) => ({
  supervisores: [],
  isLoading: false,
  error: null,

  fetchSupervisores: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await supervisoresApi.getSupervisores();
      set({ supervisores: data, isLoading: false });
      return data;
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? String((error as { response?: { data?: unknown } }).response?.data || '') || 'Error al obtener supervisores'
          : error instanceof Error
          ? error.message
          : 'Error al obtener supervisores';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  createSupervisor: async (dto: CreateSupervisorDTO) => {
    set({ isLoading: true, error: null });
    try {
      const created = await supervisoresApi.createSupervisor(dto);
      set((state) => ({
        supervisores: [created, ...state.supervisores],
        isLoading: false,
      }));
      return created;
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? String((error as { response?: { data?: unknown } }).response?.data || '') || 'Error al crear supervisor'
          : error instanceof Error
          ? error.message
          : 'Error al crear supervisor';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
