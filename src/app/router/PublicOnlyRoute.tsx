import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';

/**
 * Guardia de navegación para rutas exclusivas de invitados (ej. /login).
 * Si el usuario ya cuenta con sesión activa, redirige automáticamente al panel principal.
 */
export const PublicOnlyRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
