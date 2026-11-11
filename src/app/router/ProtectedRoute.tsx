import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';

/**
 * Guardia de navegación para rutas privadas.
 * Si el usuario no tiene una sesión activa de DonaTrack, redirige a /login
 * preservando la ruta de origen para navegación posterior.
 */
export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    const staffRoute = /^\/dashboard\/(donaciones|donantes|entidades|supervisores)(\/|$)/.test(location.pathname);
    return <Navigate to={staffRoute ? '/login/admin' : '/login'} replace state={{ from: location }} />;
  }

  return <Outlet />;
};
