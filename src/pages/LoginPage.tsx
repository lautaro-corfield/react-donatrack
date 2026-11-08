import { Box, Container, Flex } from '@chakra-ui/react';
import { LoginCard } from '@/features/auth';

/**
 * Página de inicio de sesión de DonaTrack.
 * Renderiza el formulario unificado (email/password y Google SSO Token Swap).
 */
export const LoginPage = () => {
  return (
    <Box minH="100vh" bg="gray.50" py={{ base: '6', md: '12' }} px="4">
      <Container maxW="md">
        <Flex justify="center" align="center" minH="80vh">
          <LoginCard />
        </Flex>
      </Container>
    </Box>
  );
};
