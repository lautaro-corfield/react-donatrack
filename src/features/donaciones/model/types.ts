export type CategoriaDonacion = 'ALIMENTOS' | 'MOBILIARIO' | 'VESTIMENTA' | 'HIGIENE';
export type UnidadDonacion = 'UNIDADES' | 'KG' | 'METROS' | 'LITROS';
export type EstadoDonacion = 'PENDIENTE' | 'ADJUDICADA';

export interface Donacion {
  id: number;
  descripcion: string;
  donanteNombre: string | null;
  donanteId: number | null;
  fechaIngreso: string;
  estado: EstadoDonacion;
  donacionesSegmentadas: {
    id: number;
    categoria: CategoriaDonacion | null;
    subCategoria: string;
    cantidad: number;
    unidad: UnidadDonacion | null;
    estado: string;
    entidadBeneficiariaNombre: string | null;
    entidadBeneficiariaAsignadaId: number | null;
  }[];
}

export interface BienDonado {
  nombre: string;
  descripcion: string;
  foto?: string;
  cantidad: number;
  subCategoria: { categoria: CategoriaDonacion; descripcion: string; unidad: UnidadDonacion };
  tipo: 'PERECEDERO' | 'DURADERO';
  fechaVencimiento?: string;
  estadoBien?: 'NUEVO' | 'USADO';
}

export interface CreateDonacionDTO {
  descripcion: string;
  donanteId: number;
  bienes: BienDonado[];
}

export interface UpdateDonacionDTO {
  descripcion: string;
}

export interface DonacionesState {
  donaciones: Donacion[];
  isLoading: boolean;
  error: string | null;
  fetchDonaciones: () => Promise<void>;
  fetchDonacionById: (id: string) => Promise<Donacion | null>;
  createDonacion: (dto: CreateDonacionDTO) => Promise<void>;
  updateDonacion: (id: string, dto: UpdateDonacionDTO) => Promise<void>;
  deleteDonacion: (id: number) => Promise<void>;
}
