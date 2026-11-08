import { httpClient } from '@/shared/api/httpClient';
import type { AuthResponse, EmailLoginRequest, GoogleAuthRequest } from '../model/types';

/**
 * Servicio API para autenticación contra 'servicio-iam' (Spring Boot).
 * Consume endpoints utilizando la base URL configurada (VITE_IAM_API_URL).
 */
export const authService = {
  /**
   * Autenticación tradicional mediante correo y contraseña.
   * POST /api/auth/login
   *
   * @param payload Credenciales del usuario (email y password opcional)
   * @returns Datos de sesión (JWT de DonaTrack y objeto user)
   */
  loginWithEmail: async (payload: EmailLoginRequest): Promise<AuthResponse> => {
    const response = await httpClient.post<AuthResponse>('/api/auth/login', payload);
    return response.data;
  },

  /**
   * Token Swap: Intercambia el id_token nativo de Google por el JWT de DonaTrack.
   * POST /api/auth/social/google
   *
   * @param idToken Token de Google Identity Services
   * @returns Datos de sesión (JWT de DonaTrack y objeto user)
   */
  swapGoogleToken: async (idToken: string): Promise<AuthResponse> => {
    const payload: GoogleAuthRequest = { token: idToken };
    const response = await httpClient.post<AuthResponse>(
      '/api/auth/social/google',
      payload
    );
    return response.data;
  },

  /**
   * Invalida la sesión activa en el backend.
   */
  logout: async (): Promise<void> => {
    await httpClient.post('/api/auth/logout');
  },
};
