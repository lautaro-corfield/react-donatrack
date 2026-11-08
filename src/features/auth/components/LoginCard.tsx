import {
  Card,
  Heading,
  Image,
  Separator,
  Text,
  VStack,
} from '@chakra-ui/react';
import { LoginForm } from './LoginForm';

/**
 * Tarjeta principal de autenticación construida íntegramente con Chakra UI v3.
 * Contiene el formulario unificado de credenciales (email/password) y SSO con Google.
 */
export const LoginCard = () => {
  return (
    <Card.Root
      maxW="md"
      w="100%"
      borderWidth="1px"
      borderRadius="2xl"
      shadow="xl"
      p="2"
    >
      <Card.Header textAlign="center" pt="6" pb="2">
        <VStack gap="3">
          <Image
            src="/donatrack.jpeg"
            alt="Logo DonaTrack"
            boxSize="84px"
            objectFit="contain"
            borderRadius="2xl"
            shadow="sm"
          />
          <Heading as="h1" size="2xl" fontWeight="extrabold" colorPalette="teal">
            DonaTrack
          </Heading>
          <Card.Title fontSize="lg" fontWeight="semibold" color="gray.700">
            Iniciar Sesión
          </Card.Title>
        </VStack>
      </Card.Header>

      <Card.Body py="6">
        <VStack gap="6" width="100%">
          <LoginForm />

          <Separator />
        </VStack>
      </Card.Body>

      <Card.Footer justifyContent="center" pb="6">
        <Text fontSize="xs" color="gray.400">
          © {new Date().getFullYear()} DonaTrack
        </Text>
      </Card.Footer>
    </Card.Root>
  );
};
