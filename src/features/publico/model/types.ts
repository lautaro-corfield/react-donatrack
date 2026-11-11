/** Donación entregada, tal como la devuelven los endpoints públicos. */
export interface DonacionPublica {
  id: number;
  categoria: string | null;
  subCategoria: string | null;
  cantidad: number;
  unidad: string | null;
  entidad: string | null;
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
  fechaEntrega: string | null;
}
