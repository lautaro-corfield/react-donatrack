import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';

/**
 * Guardia de navegación para rutas exclusivas de invitados (ej. /login).
 * Si el usuario ya cuenta con sesión activa, redirige automáticamente al panel principal.
 */
export const PublicOnlyRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { state } = useLocation();
  const origen = state?.from;
  if (isAuthenticated) {
    const destino = typeof origen?.pathname === 'string' && origen.pathname.startsWith('/dashboard/')
      ? { pathname: origen.pathname, hash: origen.hash }
      : '/dashboard';
    return <Navigate to={destino} replace />;
  }

  return <Outlet />;
};
