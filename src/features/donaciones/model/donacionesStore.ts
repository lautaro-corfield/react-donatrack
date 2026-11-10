import { create } from 'zustand';
import { donacionesApi, errorDonacion } from '../api/donacionesApi';
import type { DonacionesState } from './types';

export const useDonacionesStore = create<DonacionesState>((set) => ({
  donaciones: [],
  isLoading: false,
  error: null,

  fetchDonaciones: async () => {
    set({ isLoading: true, error: null });
    try {
      const donaciones = await donacionesApi.getAll();
      set({ donaciones });
    } catch (error) {
      set({ error: errorDonacion(error, 'No se pudo cargar el listado de donaciones.') });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDonacionById: async (id) => {
    set({ error: null });
    try {
      return await donacionesApi.getById(id);
    } catch (error) {
      set({ error: errorDonacion(error, 'No se pudo cargar la donación solicitada.') });
      return null;
    }
  },

  createDonacion: async (dto) => {
    await donacionesApi.create(dto);
  },

  updateDonacion: async (id, dto) => {
    await donacionesApi.update(id, dto);
  },

  deleteDonacion: async (id) => {
    set({ error: null });
    try {
      await donacionesApi.delete(id);
      set(state => ({ donaciones: state.donaciones.filter(donacion => donacion.id !== id) }));
    } catch (error) {
      set({ error: errorDonacion(error, 'No se pudo eliminar la donación.') });
    }
  },
}));
