import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { DashboardLayout } from '../layout/DashboardLayout';
import { LoginPage } from '@/pages/LoginPage';
import { useAuthStore } from '@/features/auth';
import { GestionDonantes } from '@/features/donantes/views/Gestion';
import { DonantesCreateView } from '@/features/donantes/views/Create';
import { DonantesImportarView } from '@/features/donantes/views/Importar';
import { RegistroDonantePublico } from '@/features/donantes/views/RegistroPublico';
import { PortalDonante } from '@/features/donantes/views/Portal';
import { MisDonaciones } from '@/features/donantes/views/Donaciones';
import { AvisosDonante } from '@/features/donantes/views/Consultas';
import { MisionesEInsignias } from '@/features/donantes/views/MisionesEInsignias';
import { EntidadesPage } from '@/pages/EntidadesPage';
import {
  DonacionesListView,
  DonacionesCreateView,
  DonacionesEditView,
} from '@/features/donaciones';
import {
  SupervisoresListView,
  SupervisoresCreateView,
} from '@/features/supervisores';

function InicioDashboard() {
  const rol = useAuthStore(state => state.user?.role);
  if (rol === 'DONANTE') return <Navigate to="/dashboard/mi-actividad" replace />;
  if (rol === 'ADMIN' || rol === 'SUPERVISOR') return <Navigate to="/dashboard/donaciones" replace />;
  return <p role="alert">Tu cuenta no tiene un rol habilitado para acceder al panel.</p>;
}

function AccesoDashboard({ roles }: { roles: string[] }) {
  const rol = useAuthStore(state => state.user?.role);
  return rol && roles.includes(rol) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

/**
 * Enrutador principal de la aplicación DonaTrack.
 * Define la jerarquía de rutas públicas y privadas respetando el patrón Feature-Sliced Design.
 */
export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas (exclusivas para usuarios sin autenticar) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route path="/registro/donante" element={<RegistroDonantePublico />} />

        {/* Rutas Privadas / Protegidas con DashboardLayout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<InicioDashboard />} />
            <Route element={<AccesoDashboard roles={['DONANTE']} />}>
              <Route path="mi-actividad" element={<PortalDonante />} />
              <Route path="mis-donaciones" element={<MisDonaciones />} />
              <Route path="misiones-e-insignias" element={<MisionesEInsignias />} />
              <Route path="mis-avisos" element={<AvisosDonante />} />
            </Route>
            <Route element={<AccesoDashboard roles={['ADMIN', 'SUPERVISOR']} />}>
              <Route path="donaciones" element={<DonacionesListView />} />
              <Route path="donaciones/nueva" element={<DonacionesCreateView />} />
              <Route path="donaciones/editar/:id" element={<DonacionesEditView />} />
              <Route path="donantes" element={<GestionDonantes />} />
              <Route path="donantes/nuevo" element={<DonantesCreateView />} />
              <Route path="donantes/importar" element={<DonantesImportarView />} />
              <Route path="entidades" element={<EntidadesPage />} />
            </Route>
            <Route element={<AccesoDashboard roles={['ADMIN']} />}>
              <Route path="supervisores" element={<SupervisoresListView />} />
              <Route path="supervisores/nuevo" element={<SupervisoresCreateView />} />
            </Route>
          </Route>
        </Route>

        {/* Redirecciones por defecto */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
