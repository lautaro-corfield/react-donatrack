import { useState, type FormEvent } from 'react';
import { Button, Input, Stack, Text } from '@chakra-ui/react';
import { authService } from '../api/auth.service';
import { useAuthStore } from '../model/authStore';
import { useLocation } from 'react-router-dom';
import { GoogleLoginButton } from './GoogleLoginButton';

/**
 * Componente de formulario de inicio de sesión.
 * Soporta autenticación tradicional (email y password) y SSO con Google (Token Swap).
 * Construido con componentes nativos de Chakra UI v3.
 */
export const LoginForm = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const location = useLocation();
  const [email, setEmail] = useState((location.state as { email?: string } | null)?.email ?? '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuthError = useAuthStore((state) => state.clearError);

  const acceptSession = (token: string, user: { id: string; email: string; name: string; role?: string; picture?: string }) => {
    if (!user.role || !allowedRoles.includes(user.role)) {
      throw new Error('Esta cuenta corresponde a otro tipo de ingreso.');
    }
    setAuth(token, user);
  };

  const handleGoogle = async (idToken: string) => {
    const response = await authService.swapGoogleToken(idToken);
    acceptSession(response.token, response.user);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    clearAuthError();

    try {
      const response = await authService.loginWithEmail({
        email,
        password,
      });
      acceptSession(response.token, response.user);
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message || 'Error al iniciar sesión con credenciales'
          : err instanceof Error
          ? err.message
          : 'Ocurrió un error inesperado al iniciar sesión';

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack gap="5" width="100%">
      {(location.state as { logisticaActivada?: boolean } | null)?.logisticaActivada &&
        <Text role="status" color="green.700">Cuenta activada. Ya podés iniciar sesión.</Text>}
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <Stack gap="4" width="100%">
          <Input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            size="md"
            borderRadius="md"
          />

          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            size="md"
            borderRadius="md"
          />

          {error && (
            <Text color="red.500" fontSize="sm" fontWeight="medium">
              {error}
            </Text>
          )}

          <Button
            type="submit"
            colorPalette="teal"
            width="100%"
            disabled={isLoading}
            size="md"
            borderRadius="md"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </Stack>
      </form>

      {/* Alternativa de SSO con Google (Token Swap) preservada */}
      <Stack gap="3" align="center" width="100%">
        <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
          o continúa con
        </Text>
        <GoogleLoginButton onCredential={handleGoogle} />
      </Stack>
    </Stack>
  );
};
