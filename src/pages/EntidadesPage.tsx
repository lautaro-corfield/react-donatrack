import {
  Badge,
  Box,
  Card,
  HStack,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';

const BuildingIcon = () => (
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
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
);

/**
 * Vista placeholder para el módulo de Entidades Beneficiarias.
 */
export const EntidadesPage = () => {
  return (
    <VStack gap="6" align="stretch" maxW="5xl" mx="auto">
      <HStack justify="space-between" align="center" wrap="wrap" gap="4">
        <VStack align="start" gap="1">
          <Heading as="h1" size="2xl" color="gray.800" fontWeight="bold">
            Entidades Beneficiarias
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Administración de comedores, ONG, hospitales y centros comunitarios receptores.
          </Text>
        </VStack>
        <Badge colorPalette="purple" variant="subtle" px="3" py="1.5" borderRadius="full">
          Módulo en Construcción
        </Badge>
      </HStack>

      <Card.Root borderWidth="1px" borderRadius="2xl" shadow="sm" p="6" bg="white">
        <Card.Header pb="4">
          <HStack gap="3">
            <Box p="3" bg="purple.50" color="purple.600" borderRadius="xl">
              <BuildingIcon />
            </Box>
            <VStack align="start" gap="0">
              <Card.Title fontSize="lg" fontWeight="semibold" color="gray.800">
                Directorio de Entidades
              </Card.Title>
              <Card.Description fontSize="xs" color="gray.500">
                Próximamente se integrará el consumo del microservicio de beneficiarios y logística.
              </Card.Description>
            </VStack>
          </HStack>
        </Card.Header>

        <Card.Body py="8">
          <VStack gap="3" align="center" textAlign="center" py="8">
            <Text fontSize="md" color="gray.600" maxW="md">
              Gestiona los convenios, requerimientos específicos y entregas programadas
              para cada entidad beneficiaria asociada a la red DonaTrack.
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
};
