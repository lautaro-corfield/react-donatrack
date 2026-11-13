import { isAxiosError } from 'axios';
import { httpClient } from '@/shared/api/httpClient';
import type { Camion, CamionDatos, Chofer, ChoferDatos, CrearRuta, Recorrido, SegmentoLogistico } from '../model/types';

const base = '/api/logistica/panel';
const cuentas = '/api/users/administradores-logistica';
const activacionLogistica = '/api/auth/registro/logistica';

export interface CuentaLogistica {
  email: string;
  activa: boolean;
}

export const logisticaApi = {
  cuentas: (signal?: AbortSignal) => httpClient.get<CuentaLogistica[]>(cuentas, { signal }).then(r => r.data),
  autorizar: (email: string) => httpClient.post(cuentas, { email }),
  activar: (email: string, password: string) => httpClient.post(activacionLogistica, { email, password }),
  camiones: (signal?: AbortSignal) => httpClient.get<Camion[]>(base + '/camiones', { signal }).then(r => r.data),
  choferes: (signal?: AbortSignal) => httpClient.get<Chofer[]>(base + '/choferes', { signal }).then(r => r.data),
  segmentos: (signal?: AbortSignal) => httpClient.get<SegmentoLogistico[]>(base + '/segmentos', { signal }).then(r => r.data),
  rutas: (signal?: AbortSignal) => httpClient.get<Recorrido[]>(base + '/rutas', { signal }).then(r => r.data),
  historialRutas: (signal?: AbortSignal) => httpClient.get<Recorrido[]>(base + '/rutas/historial', { signal }).then(r => r.data),
  crearCamion: (datos: CamionDatos) => httpClient.post(base + '/camiones', datos),
  crearChofer: (datos: ChoferDatos) => httpClient.post(base + '/choferes', datos),
  crearRuta: (datos: CrearRuta) => httpClient.post(base + '/rutas', datos),
  iniciar: (id: string) => httpClient.post(`${base}/rutas/${id}/iniciar`),
  llegada: (id: string, segmento: number) => httpClient.post(`${base}/rutas/${id}/segmentos/${segmento}/llegada`),
};

export function mensajeLogistica(error: unknown, fallback: string) {
  if (!isAxiosError<{ detail?: string } | string>(error)) return fallback;
  const datos = error.response?.data;
  return typeof datos === 'string' ? datos || fallback : datos?.detail || fallback;
}
