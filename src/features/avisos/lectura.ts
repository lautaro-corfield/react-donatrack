import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from '@/features/auth';

type IdAviso = number | string;
const vacio: string[] = [];

const useLecturas = create<{
  leidosPorCuenta: Record<string, string[]>;
  marcar: (cuenta: string, id: IdAviso) => void;
}>()(persist(set => ({
  leidosPorCuenta: {},
  marcar: (cuenta, id) => set(({ leidosPorCuenta }) => {
    const leidos = leidosPorCuenta[cuenta] ?? vacio;
    if (leidos.includes(String(id))) return { leidosPorCuenta };
    return { leidosPorCuenta: { ...leidosPorCuenta, [cuenta]: [...leidos, String(id)] } };
  }),
}), { name: 'donatrack-avisos-leidos' }));

export function useLecturaAvisos() {
  const cuenta = useAuthStore(state => `${state.user?.role}:${state.user?.email}`);
  const leidos = useLecturas(state => state.leidosPorCuenta[cuenta] ?? vacio);
  const marcar = useLecturas(state => state.marcar);
  return {
    sinLeer: (id: IdAviso) => !leidos.includes(String(id)),
    marcarLeido: (id: IdAviso) => marcar(cuenta, id),
  };
}
