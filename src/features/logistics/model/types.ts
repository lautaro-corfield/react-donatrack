export type ShipmentStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface Shipment {
  id: string;
  trackingCode: string;
  destination: string;
  category: string;
  quantityUnits: number;
  status: ShipmentStatus;
  updatedAt: string;
}

export interface CamionDatos {
  patente: string;
  marca: string;
  modelo: string;
  capacidadCarga: number;
  volumen: number;
  altura: number;
}

export interface ChoferDatos {
  nombre: string;
  apellido: string;
  dni: string;
}

export type Camion = CamionDatos & { id: string };
export type Chofer = ChoferDatos & { id: string };

export interface SegmentoLogistico {
  id: number;
  entidadId: number;
  entidad: string | null;
  direccion: string;
  cantidad: number;
  unidad: string | null;
  estado: string;
  llegada: string | null;
}

export interface CrearRuta {
  solicitudId: string;
  camionId: string;
  choferId: string;
  segmentoIds: number[];
}

export interface Recorrido {
  ruta: {
    id: string;
    camionId: string;
    choferId: string;
    paradas: { orden: number; direccion: string; enviosIds: string[] }[];
    segmentosPanel: number[];
  };
  segmentos: SegmentoLogistico[];
}
