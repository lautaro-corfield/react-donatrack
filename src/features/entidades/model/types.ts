export type TipoNecesidad = 'RECURRENTE' | 'EXTRAORDINARIA';

export interface CrearNecesidad {
  subCategoriaNombre: string;
  cantidad: number;
  fechaLimite: string;
  tipoNecesidad: TipoNecesidad;
  diasRecurrencia?: number;
  causa?: string;
}

export interface Necesidad {
  id: number;
  entidadBeneficiariaId: number;
  subCategoriaNombre: string;
  cantidadSolicitada: number;
  cantidadCubierta: number;
  fechaDelPedido: string | null;
  estado: string;
  activa: boolean;
  tipoNecesidad: TipoNecesidad;
  diasRecurrencia?: number;
  causa?: string;
}

export interface Entidad {
  idEntidadBeneficiaria: number;
  totalDonacionesRecibidas: number;
  datosDeEntidad: {
    razonSocial: string;
    tipo: string;
    rubro: string;
    cuit: string;
    direccion?: { calle1?: string; altura?: number; ciudad?: { nombre?: string; provincia?: { nombre?: string; pais?: { nombre?: string } } } };
    medioDeContacto?: Record<string, string[]>;
  };
}

export interface EventoDonacion { estado: string; fecha: string; descripcion: string | null }

export interface SegmentoRecibido {
  id: number;
  estado: string;
  categoria: string | null;
  subcategoria: string | null;
  cantidad: number;
  unidad: string | null;
  eventos: EventoDonacion[];
  comprobante: { id: string; fechaEntrega: string; detalles: string | null } | null;
  fotos: number[];
  puedeConfirmarRecepcion?: boolean;
}

export interface DonacionRecibida {
  id: number;
  descripcion: string | null;
  fechaIngreso: string | null;
  donante: string | null;
  segmentos: SegmentoRecibido[];
}

export interface AvisoEntidad { id: number | string; asunto: string; mensaje: string; fecha: string | null; segmentoId?: number | null }
