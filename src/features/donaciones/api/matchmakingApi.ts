import { httpClient } from '@/shared/api/httpClient';

export interface EntidadRanking {
  id: number;
  razonSocial: string;
  cantNecesidadesActivas: number;
}

export interface ResultadoMatchmaking {
  donacionSegmentadaId: number;
  subCategoria: string;
  cantidadBienes: number;
  coincidencias: EntidadRanking[];
  rankingCompatibilidad: EntidadRanking[];
  rankingSubAtendidos: EntidadRanking[];
  entidadesPropuestas: EntidadRanking[];
  huboCoincidencias: boolean;
}

export const matchmakingApi = {
  ranking: (segmentoId: number) =>
    httpClient.get<ResultadoMatchmaking>('/matchmaking/ranking', { params: { donacionSegmentadaId: segmentoId } }).then(r => r.data),
  asignar: (segmentoId: number, entidadId: number) =>
    httpClient.post('/matchmaking/asignar', { donacionSegmentadaId: segmentoId, entidadBeneficiariaId: entidadId }),
};
