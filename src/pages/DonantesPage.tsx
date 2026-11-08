import {
  Badge,
  Box,
  Card,
  HStack,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';

const UsersIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

/**
 * Vista placeholder para el módulo de Gestión de Donantes.
 */
export const DonantesPage = () => {
  return (
    <VStack gap="6" align="stretch" maxW="5xl" mx="auto">
      <HStack justify="space-between" align="center" wrap="wrap" gap="4">
        <VStack align="start" gap="1">
          <Heading as="h1" size="2xl" color="gray.800" fontWeight="bold">
            Donantes
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Registro, clasificación y fidelización de donantes particulares y corporativos.
          </Text>
        </VStack>
        <Badge colorPalette="teal" variant="subtle" px="3" py="1.5" borderRadius="full">
          Módulo en Construcción
        </Badge>
      </HStack>

      <Card.Root borderWidth="1px" borderRadius="2xl" shadow="sm" p="6" bg="white">
        <Card.Header pb="4">
          <HStack gap="3">
            <Box p="3" bg="teal.50" color="teal.600" borderRadius="xl">
              <UsersIcon />
            </Box>
            <VStack align="start" gap="0">
              <Card.Title fontSize="lg" fontWeight="semibold" color="gray.800">
                Padrón de Donantes
              </Card.Title>
              <Card.Description fontSize="xs" color="gray.500">
                Próximamente se integrará el consumo del microservicio de donantes.
              </Card.Description>
            </VStack>
          </HStack>
        </Card.Header>

        <Card.Body py="8">
          <VStack gap="3" align="center" textAlign="center" py="8">
            <Text fontSize="md" color="gray.600" maxW="md">
              Aquí podrás consultar el historial de aportes, segmentar por recurrencia y
              gestionar los certificados de donación de cada donante registrado.
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
};
