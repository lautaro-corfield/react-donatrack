import type { DonacionPublica } from './types';

// Valores de las enums Unidad y CategoriaBien del backend.
const UNIDADES: Record<string, string> = {
  KG: 'kg',
  LITROS: 'l',
  METROS: 'm',
  UNIDADES: 'u.',
};

const CATEGORIAS: Record<string, string> = {
  ALIMENTOS: 'Alimentos',
  VESTIMENTA: 'Vestimenta',
  MOBILIARIO: 'Mobiliario',
  HIGIENE: 'Higiene',
};

/** "ALIMENTOS" → "Alimentos". Si no está en el mapa, capitaliza el texto. */
export const nombreCategoria = (categoria: string | null): string => {
  if (!categoria) return 'Sin categoría';
  return (
    CATEGORIAS[categoria] ??
    categoria.charAt(0) + categoria.slice(1).toLowerCase().replace(/_/g, ' ')
  );
};

/** "12 kg de Leche en polvo" */
export const descripcionDonacion = (d: DonacionPublica): string => {
  const unidad = d.unidad ? (UNIDADES[d.unidad] ?? d.unidad.toLowerCase()) : '';
  const que = d.subCategoria ?? nombreCategoria(d.categoria);
  return `${d.cantidad} ${unidad} de ${que}`.replace(/\s+/g, ' ');
};

/** Fecha corta en español, o "Fecha no disponible". */
export const fechaCorta = (iso: string | null): string => {
  if (!iso) return 'Fecha no disponible';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return 'Fecha no disponible';
  return fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
};
