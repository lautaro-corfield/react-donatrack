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
