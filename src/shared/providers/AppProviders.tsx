import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import type { ReactNode } from 'react';
import { Toaster } from '@/shared/components/Toaster';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Proveedor raíz de infraestructura de DonaTrack:
 * - ChakraProvider v3 para sistema de diseño y componentes UI (sin CSS puro ni Tailwind).
 * - Toaster para el sistema de notificaciones/toasts de Chakra UI v3.
 * - GoogleOAuthProvider para integración nativa de Google Identity Services.
 */
export const AppProviders = ({ children }: AppProvidersProps) => {
  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    'mock-google-client-id.apps.googleusercontent.com';

  return (
    <ChakraProvider value={defaultSystem}>
      <GoogleOAuthProvider clientId={googleClientId}>
        {children}
        <Toaster />
      </GoogleOAuthProvider>
    </ChakraProvider>
  );
};
