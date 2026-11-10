export interface ResumenDonante {
  nombre: string;
  humana: boolean;
  ranking: number;
  metricas: {
    donacionesMesActual: number;
    totalDonacionesExitosas: number;
    entidadesAyudadasCount: number;
    comparacionesMensuales: { anio: number; mes: number; totalDonaciones: number }[];
  };
  perfil: {
    visibilidadInsignia: boolean;
    categoriaDonante: string;
    misionActualId: number | null;
    progreso: number | null;
  } | null;
}

export interface Mision {
  orden: number;
  nivel: string;
  titulo: string;
  descripcion: string;
  objetivo: number;
  progresoEnUnidades: boolean;
}

export interface DonacionPropia {
  id: number;
  descripcion: string;
  fechaIngreso: string | null;
  segmentos: {
    id: number;
    estado: string;
    categoria: string | null;
    subcategoria: string | null;
    eventos: { estado: string; fecha: string; descripcion: string | null }[];
    comprobante: { fechaEntrega: string; nombreEntidad: string; detallesLogistica: string } | null;
  }[];
}

export interface AvisoDonante {
  id: number;
  asunto: string;
  mensaje: string;
  fecha: string | null;
}

export interface EntidadDirectorio {
  id: number;
  nombre: string;
  rubro: string | null;
}

export interface AltaDonante {
  mediosDeContacto: { medio: string; valor: string }[];
  direccion?: { calle1: string; altura: number; sinAltura: boolean; ciudadNombre: string; provinciaNombre: string; paisNombre: string };
  nombre?: string;
  apellido?: string;
  nroDocumento?: string;
  genero?: string;
  edad?: number;
  razonSocial?: string;
  cuit?: string;
  rubro?: string;
  tipo?: string;
}

export interface RegistroDonanteResponse {
  token: string;
  user: {
    id: string | number;
    email: string;
    role: string;
    name: string;
    picture?: string;
  };
}

export interface DonanteEncontrado {
  id: number;
  nombre: string;
}
