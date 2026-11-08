import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../api/auth.service';
import type { AuthState, User } from './types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Inyecta directamente el token y datos del usuario autenticado en el estado global.
       */
      setAuth: (token: string, user: User) => {
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      /**
       * Ejecuta el Token Swap enviando el id_token nativo de Google a servicio-iam.
       * El frontend descarta el token de Google y almacena exclusivamente el JWT de DonaTrack.
       */
      loginWithGoogle: async (idToken: string) => {
        set({ isLoading: true, error: null });
        try {
          const authData = await authService.swapGoogleToken(idToken);

          set({
            token: authData.token,
            user: authData.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err: unknown) {
          const responseData =
            err && typeof err === 'object' && 'response' in err
              ? (err as { response?: { data?: unknown } }).response?.data
              : null;

          const message =
            typeof responseData === 'string' && responseData.trim()
              ? responseData
              : responseData &&
                typeof responseData === 'object' &&
                'message' in responseData &&
                typeof (responseData as { message?: unknown }).message === 'string'
              ? (responseData as { message: string }).message
              : responseData &&
                typeof responseData === 'object' &&
                'error' in responseData &&
                typeof (responseData as { error?: unknown }).error === 'string'
              ? (responseData as { error: string }).error
              : err instanceof Error
              ? err.message
              : 'Error de autenticación en servicio-iam';

          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: message,
          });
          throw err;
        }
      },

      /**
       * Cierra la sesión activa de forma imperativa o declarativa.
       * Limpia credenciales del store y del storage persistente.
       */
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      /**
       * Limpia mensajes de error residuales.
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'donatrack_auth_session',
      storage: createJSONStorage(() => localStorage),
      // Persiste únicamente la sesión válida; omite flags transitorios como loading o errores
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
