import { create } from 'zustand';
import { donacionesApi } from '../api/donacionesApi';
import type { CreateDonacionDTO, DonacionesState, Donacion, UpdateDonacionDTO } from './types';

// Datos iniciales de demostración para visualización inmediata
const INITIAL_MOCK_DONACIONES: Donacion[] = [
  {
    id: 'don-001',
    descripcion: 'Lote de leche en polvo y alimentos no perecederos',
    categoria: 'ALIMENTOS',
    cantidad: 250,
    unidadMedida: 'kg',
    estado: 'RECIBIDA',
    donanteNombre: 'Supermercados del Sur S.A.',
    entidadDestino: 'Comedor Los Piletones',
    fechaRegistro: '2026-11-01',
    observaciones: 'Fecha de caducidad superior a 12 meses.',
  },
  {
    id: 'don-002',
    descripcion: 'Cajas de gasas, analgésicos y botiquines de primeros auxilios',
    categoria: 'MEDICAMENTOS',
    cantidad: 40,
    unidadMedida: 'cajas',
    estado: 'EN_TRANSITO',
    donanteNombre: 'Laboratorios Farmasur',
    entidadDestino: 'Hospital Comunitario San Roque',
    fechaRegistro: '2026-11-04',
    observaciones: 'Mantener en ambiente fresco.',
  },
  {
    id: 'don-003',
    descripcion: 'Aporte monetario para fondo de emergencia invernal',
    categoria: 'DINERO',
    cantidad: 500000,
    unidadMedida: 'ARS',
    estado: 'ENTREGADA',
    donanteNombre: 'Fundación Solidaria Andina',
    entidadDestino: 'Hogar Esperanza de Vida',
    fechaRegistro: '2026-11-06',
    observaciones: 'Transferencia bancaria directa con comprobante validado.',
  },
];

export const useDonacionesStore = create<DonacionesState>((set, get) => ({
  donaciones: INITIAL_MOCK_DONACIONES,
  selectedDonacion: null,
  isLoading: false,
  error: null,

  fetchDonaciones: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await donacionesApi.getAll();
      if (Array.isArray(data) && data.length > 0) {
        set({ donaciones: data, isLoading: false });
      } else {
        // Mantiene datos locales de respaldo si la respuesta está vacía
        set({ isLoading: false });
      }
    } catch {
      // Fallback a mock data para entorno de desarrollo local sin microservicio activo
      set({ isLoading: false });
    }
  },

  fetchDonacionById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await donacionesApi.getById(id);
      set({ selectedDonacion: data, isLoading: false });
      return data;
    } catch {
      // Búsqueda en el estado local de respaldo
      const local = get().donaciones.find((d) => d.id === id) || null;
      set({ selectedDonacion: local, isLoading: false });
      return local;
    }
  },

  createDonacion: async (dto: CreateDonacionDTO) => {
    set({ isLoading: true, error: null });
    try {
      const created = await donacionesApi.create(dto);
      set((state) => ({
        donaciones: [created, ...state.donaciones],
        isLoading: false,
      }));
      return created;
    } catch {
      // Creación local para desarrollo
      const localCreated: Donacion = {
        ...dto,
        id: `don-${Date.now().toString().slice(-4)}`,
        fechaRegistro: new Date().toISOString().split('T')[0],
      };
      set((state) => ({
        donaciones: [localCreated, ...state.donaciones],
        isLoading: false,
      }));
      return localCreated;
    }
  },

  updateDonacion: async (id: string, dto: UpdateDonacionDTO) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await donacionesApi.update(id, dto);
      set((state) => ({
        donaciones: state.donaciones.map((d) => (d.id === id ? updated : d)),
        selectedDonacion: updated,
        isLoading: false,
      }));
      return updated;
    } catch {
      // Actualización local para desarrollo
      let updatedLocal: Donacion | null = null;
      set((state) => {
        const nextList = state.donaciones.map((d) => {
          if (d.id === id) {
            updatedLocal = { ...d, ...dto };
            return updatedLocal;
          }
          return d;
        });
        return {
          donaciones: nextList,
          selectedDonacion: updatedLocal,
          isLoading: false,
        };
      });
      return updatedLocal!;
    }
  },

  deleteDonacion: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await donacionesApi.delete(id);
      set((state) => ({
        donaciones: state.donaciones.filter((d) => d.id !== id),
        isLoading: false,
      }));
    } catch {
      // Eliminación local para desarrollo
      set((state) => ({
        donaciones: state.donaciones.filter((d) => d.id !== id),
        isLoading: false,
      }));
    }
  },

  clearError: () => set({ error: null }),
}));
