import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/model/authStore';

/**
 * Instancia HTTP global para comunicación con los microservicios a través del API Gateway (puerto 8084).
 * Cumple con las políticas de seguridad:
 * - Base URL configurada vía VITE_API_GATEWAY_URL (default: http://localhost:8084).
 * - Inyección automática del JWT de DonaTrack en el header 'Authorization: Bearer <token>'.
 * - Detección de HTTP 401 (Unauthorized) con logout imperativo en Zustand y redirección a login.
 */
export const httpClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_GATEWAY_URL ||
    'http://localhost:8084',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000,
});

const publicAuthPaths = new Set([
  '/api/auth/login',
  '/api/auth/registro/donante',
  '/api/auth/registro/entidad',
  '/api/auth/social/google/registro-entidad',
  '/api/auth/social/google',
  '/api/auth/social/google/registro-donante',
]);

// Interceptor de Request: inyección transparente del token de sesión
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers && !publicAuthPaths.has(config.url ?? '')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor de Response: si el API Gateway devuelve HTTP 401, logout imperativo y redirección
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !publicAuthPaths.has(error.config?.url ?? '')) {
      // 1. Limpieza imperativa del estado de autenticación en Zustand
      const role = useAuthStore.getState().user?.role;
      useAuthStore.getState().logout();

      // 2. Redirección segura a la vista de login para evitar bucles de navegación
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.replace(role === 'ADMIN' || role === 'SUPERVISOR' ? '/login/personal' : '/login');
      }
    }
    return Promise.reject(error);
  }
);
