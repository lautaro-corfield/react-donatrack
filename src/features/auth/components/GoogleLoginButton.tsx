import { useState } from 'react';
import { Box, Flex, Spinner, Text, VStack } from '@chakra-ui/react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuthStore } from '../model/authStore';

export const GoogleLoginButton = ({
  onCredential,
  buttonText = 'signin_with',
}: {
  onCredential?: (idToken: string) => Promise<void>;
  buttonText?: 'signin_with' | 'signup_with';
} = {}) => {
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const clearAuthError = useAuthStore((state) => state.clearError);

  const [localError, setLocalError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const errorMessage = localError || authError;

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    setLocalError(null);
    clearAuthError();

    if (!credentialResponse.credential) {
      setLocalError('No se recibió la credencial de autenticación de Google.');
      return;
    }

    try {
      if (onCredential) {
        setLocalLoading(true);
        await onCredential(credentialResponse.credential);
      } else {
        await loginWithGoogle(credentialResponse.credential);
      }
    } catch (error: unknown) {
      const responseData =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: unknown } }).response?.data
          : null;

      const message =
        typeof responseData === 'string' && responseData.trim()
          ? responseData
          : responseData &&
            typeof responseData === 'object' &&
            'message' in responseData &&
            typeof (responseData as { message?: unknown }).message === 'string'
          ? (responseData as { message: string }).message
          : error instanceof Error
          ? error.message
          : 'Error al comunicarse con el servidor de autenticación.';

      setLocalError(message);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleError = () => {
    clearAuthError();
    setLocalError('Fallo en la autenticación con el SDK de Google.');
  };

  if (isLoading || localLoading) {
    return (
      <Flex direction="column" align="center" justify="center" py="4" gap="3">
        <Spinner size="md" colorPalette="teal" />
        <Text fontSize="sm" color="gray.500">
          Validando credenciales con DonaTrack IAM...
        </Text>
      </Flex>
    );
  }

  return (
    <VStack width="100%" align="center" gap="3">
      <Box
        width="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={!onCredential}
          shape="pill"
          theme="outline"
          size="large"
          text={buttonText}
        />
      </Box>

      {errorMessage && (
        <Text
          color="red.500"
          fontSize="sm"
          fontWeight="medium"
          textAlign="center"
          px="2"
        >
          {errorMessage}
        </Text>
      )}
    </VStack>
  );
};
