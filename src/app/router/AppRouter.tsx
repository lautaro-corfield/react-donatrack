import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { DashboardLayout } from '../layout/DashboardLayout';
import { LoginPage } from '@/pages/LoginPage';
import { EntidadesPage } from '@/pages/EntidadesPage';
import {
  DonantesHubView,
  DonantesCreateView,
  DonantesListView,
} from '@/features/donantes';
import {
  DonacionesListView,
  DonacionesCreateView,
  DonacionesEditView,
} from '@/features/donaciones';
import {
  SupervisoresListView,
  SupervisoresCreateView,
} from '@/features/supervisores';

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

        {/* Rutas Privadas / Protegidas con DashboardLayout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard/donaciones" replace />} />

            {/* Feature: Donaciones */}
            <Route path="donaciones" element={<DonacionesListView />} />
            <Route path="donaciones/nueva" element={<DonacionesCreateView />} />
            <Route path="donaciones/editar/:id" element={<DonacionesEditView />} />

            {/* Feature: Supervisores (Acceso Admin) */}
            <Route path="supervisores" element={<SupervisoresListView />} />
            <Route path="supervisores/nuevo" element={<SupervisoresCreateView />} />

            {/* Feature: Donantes */}
            <Route path="donantes" element={<DonantesHubView />} />
            <Route path="donantes/nuevo" element={<DonantesCreateView />} />
            <Route path="donantes/lista" element={<DonantesListView />} />

            {/* Placeholders en proceso de migración FSD */}
            <Route path="entidades" element={<EntidadesPage />} />
          </Route>
        </Route>

        {/* Redirecciones por defecto */}
        <Route path="/" element={<Navigate to="/dashboard/donaciones" replace />} />
        <Route path="*" element={<Navigate to="/dashboard/donaciones" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
