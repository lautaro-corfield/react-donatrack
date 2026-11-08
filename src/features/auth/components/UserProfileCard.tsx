import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Code,
  HStack,
  Heading,
  Separator,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useAuthStore } from '../model/authStore';

export const UserProfileCard = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  if (!user) {
    return null;
  }

  // Previsualización segura y enmascarada del JWT de DonaTrack
  const maskedToken = token
    ? `${token.slice(0, 16)}...${token.slice(-12)}`
    : 'No token disponible';

  return (
    <Card.Root
      maxW="lg"
      w="100%"
      borderWidth="1px"
      borderRadius="2xl"
      shadow="xl"
      p="2"
    >
      <Card.Header pb="3">
        <HStack justify="space-between" align="center">
          <Heading size="md" color="teal.600">
            DonaTrack - Sesión Activa
          </Heading>
          <Badge colorPalette="green" variant="solid" px="2" py="1" borderRadius="full">
            ● Autenticado
          </Badge>
        </HStack>
      </Card.Header>

      <Card.Body py="4">
        <VStack gap="5" align="stretch">
          <HStack gap="4" align="center">
            <Avatar.Root size="xl">
              <Avatar.Fallback name={user.name || 'Usuario'} />
              {user.picture && <Avatar.Image src={user.picture} alt={user.name} />}
            </Avatar.Root>
            <VStack align="start" gap="1">
              <Text fontWeight="bold" fontSize="lg" color="gray.800">
                {user.name}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {user.email}
              </Text>
              <HStack gap="2" mt="1">
                {user.role && (
                  <Badge colorPalette="purple" variant="subtle">
                    {user.role}
                  </Badge>
                )}
                {user.roles?.map((r) => (
                  <Badge key={r} colorPalette="blue" variant="subtle">
                    {r}
                  </Badge>
                ))}
              </HStack>
            </VStack>
          </HStack>

          <Separator />

          <Box
            p="3"
            bg="gray.50"
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Text fontSize="xs" fontWeight="semibold" color="gray.600" mb="1">
              DonaTrack JWT (Emitido por servicio-iam):
            </Text>
            <Code fontSize="xs" wordBreak="break-all" p="1" width="100%">
              {maskedToken}
            </Code>
            <Text fontSize="2xs" color="gray.400" mt="1">
              * Inyectado automáticamente por el interceptor de Axios en cada petición.
            </Text>
          </Box>
        </VStack>
      </Card.Body>

      <Card.Footer pt="3">
        <Button
          colorPalette="red"
          variant="outline"
          width="100%"
          borderRadius="lg"
          onClick={logout}
        >
          Cerrar Sesión
        </Button>
      </Card.Footer>
    </Card.Root>
  );
};
