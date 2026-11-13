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
  donacionId?: number | null;
}

export interface AltaDonante {
  mediosDeContacto: { medio: string; valor: string }[];
  medioPredeterminado: { medio: TipoNotificador; valor: string };
  representantes?: { nombre: string; apellido: string; nroDocumento: number }[];
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
  email: string | null;
  dni: string | null;
}

export type TipoPersona = 'HUMANA' | 'JURIDICA';

export type TipoOrganizacion =
  | 'ONG'
  | 'EMPRESA'
  | 'INSTITUCION'
  | 'GUBERNAMENTAL';

export type TipoNotificador = 'EMAIL' | 'SMS' | 'WHATSAPP';
export type TipoMedioContacto = TipoNotificador;

export interface ContactoValor {
  medio: TipoNotificador;
  valor: string;
}

export interface Direccion {
  id?: number;
  calle?: string;
  calle1?: string;
  calle2?: string;
  altura?: number;
  sinAltura?: boolean;
  piso?: number | string;
  cuerpo?: number | string;
  depto?: string;
  departamento?: string;
  codigoPostal?: string;
  direccion?: string;
}

export interface RepresentanteRequest {
  nombre: string;
  apellido: string;
  nroDocumento: number;
}

export interface PersonaHumanaDomain {
  id?: number;
  nombre: string;
  apellido: string;
  genero?: string;
  fechaNacimiento?: string;
  edad?: number;
  nroDocumento: string;
  direccion?: Direccion;
  medioDeContacto?: Record<string, string[]>;
  medioPredeterminado?: { medio: string; valor: string };
  tipoPersona?: 'HUMANA';
}

export interface PersonaJuridicaDomain {
  id?: number;
  razonSocial: string;
  tipo: TipoOrganizacion;
  rubro?: string;
  personasRepresentantes?: RepresentanteRequest[];
  direccion?: Direccion;
  medioDeContacto?: Record<string, string[]>;
  medioPredeterminado?: { medio: string; valor: string };
  tipoPersona?: 'JURIDICA';
}

export type PersonaDomain = PersonaHumanaDomain | PersonaJuridicaDomain;

export interface Donante {
  id: number | string;
  persona: {
    id?: number;
    nombre?: string;
    apellido?: string;
    razonSocial?: string;
    nroDocumento?: string;
    genero?: string;
    fechaNacimiento?: string;
    edad?: number;
    tipo?: TipoOrganizacion | string;
    rubro?: string;
    personasRepresentantes?: RepresentanteRequest[];
    direccion?: Direccion;
    medioDeContacto?: Record<string, string[]>;
    mediosDeContacto?: { tipoNotificador?: string; medio?: string; valor: string }[];
    medioPredeterminado?: { medio: string; valor: string };
    tipoPersona?: TipoPersona;
  };
}

// DTOs para envío al backend (POST /donantes/humano y /donantes/juridico)
export interface CrearPersonaHumanaDTO {
  nombre: string;
  apellido: string;
  nroDocumento: string;
  genero?: string;
  fechaNacimiento?: string;
  edad?: number;
  direccion?: Direccion;
  mediosDeContacto: ContactoValor[];
  medioPredeterminado: { medio: string; valor: string };
}

export interface CrearPersonaJuridicaDTO {
  razonSocial: string;
  tipo: TipoOrganizacion;
  rubro?: string;
  representantes?: RepresentanteRequest[];
  direccion?: Direccion;
  mediosDeContacto: ContactoValor[];
  medioPredeterminado: { medio: string; valor: string };
}

// Estructura de formulario unificado para creación y edición
export interface DonanteFormData {
  tipoPersona: TipoPersona;
  // Campos Humana
  nombre: string;
  apellido: string;
  nroDocumento: string;
  genero: string;
  fechaNacimiento: string;
  // Campos Jurídica
  razonSocial: string;
  tipoOrganizacion: TipoOrganizacion;
  rubro: string;
  representanteNombre?: string;
  representanteApellido?: string;
  representanteDocumento?: string;
  // Campos Comunes
  email: string;
  telefono: string;
  calle: string;
  altura: string;
  piso: string;
  depto: string;
  codigoPostal: string;
  medioPreferido: TipoMedioContacto;
}

export interface ImportacionResponseDTO {
  success: boolean;
  message: string;
  data?: Donante[];
}
