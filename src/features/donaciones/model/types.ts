export type CategoriaDonacion =
  | 'ALIMENTOS'
  | 'MEDICAMENTOS'
  | 'ROPA'
  | 'DINERO'
  | 'JUGUETES'
  | 'OTROS';

export type EstadoDonacion =
  | 'PENDIENTE'
  | 'RECIBIDA'
  | 'EN_TRANSITO'
  | 'ENTREGADA'
  | 'CANCELADA';

export interface Donacion {
  id: string;
  descripcion: string;
  categoria: CategoriaDonacion;
  cantidad: number;
  unidadMedida: string;
  estado: EstadoDonacion;
  donanteNombre: string;
  entidadDestino: string;
  fechaRegistro: string;
  observaciones?: string;
}

export type CreateDonacionDTO = Omit<Donacion, 'id' | 'fechaRegistro'>;

export type UpdateDonacionDTO = Partial<CreateDonacionDTO>;

export interface DonacionesState {
  donaciones: Donacion[];
  selectedDonacion: Donacion | null;
  isLoading: boolean;
  error: string | null;
  fetchDonaciones: () => Promise<void>;
  fetchDonacionById: (id: string) => Promise<Donacion | null>;
  createDonacion: (dto: CreateDonacionDTO) => Promise<Donacion>;
  updateDonacion: (id: string, dto: UpdateDonacionDTO) => Promise<Donacion>;
  deleteDonacion: (id: string) => Promise<void>;
  clearError: () => void;
}
