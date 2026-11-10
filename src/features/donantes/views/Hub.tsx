import { useEffect } from 'react';
import {
  Badge,
  Box,
  Card,
  Grid,
  GridItem,
  HStack,
  Heading,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { useDonantesStore } from '../model/donantesStore';

export const DonantesHubView = () => {
  const navigate = useNavigate();
  const donantes = useDonantesStore((state) => state.donantes);
  const isLoading = useDonantesStore((state) => state.isLoading);
  const isInitialized = useDonantesStore((state) => state.isInitialized);
  const fetchDonantes = useDonantesStore((state) => state.fetchDonantes);

  useEffect(() => {
    fetchDonantes();
  }, [fetchDonantes]);

  const isPending = isLoading || !isInitialized;

  const humanasCount = donantes.filter(
    (d) => d.persona.tipoPersona === 'HUMANA' || !!d.persona.nombre
  ).length;

  const juridicasCount = donantes.filter(
    (d) => d.persona.tipoPersona === 'JURIDICA' || !!d.persona.razonSocial
  ).length;

  return (
    <VStack gap="8" align="stretch" maxW="5xl" mx="auto" py="4">
      {/* Encabezado Principal */}
      <PageHeader
        title="Gestión de Donantes"
        subtitle="Administración integral de personas físicas y jurídicas, altas individuales o masivas y consulta del padrón."
        badge={
          <Badge colorPalette="teal" variant="subtle" px="3" py="1" borderRadius="full">
            {isPending ? (
              <HStack gap="1.5">
                <Spinner size="xs" colorPalette="teal" />
                <Text fontSize="xs">Cargando...</Text>
              </HStack>
            ) : (
              `${donantes.length} registrados`
            )}
          </Badge>
        }
      />

      {/* Card Principal con las 2 Píldoras Interactivas */}
      <Card.Root
        borderRadius="3xl"
        borderWidth="1px"
        borderColor="gray.200"
        shadow="xl"
        bg="white"
        p={{ base: 6, md: 10 }}
      >
        <VStack gap="8" align="stretch">
          <VStack align="center" textAlign="center" gap="2">
            <Badge
              colorPalette="teal"
              variant="surface"
              borderRadius="full"
              px="4"
              py="1"
              fontSize="xs"
              fontWeight="bold"
              letterSpacing="wider"
              textTransform="uppercase"
            >
              Módulo de Donantes
            </Badge>
            <Heading as="h2" size="xl" fontWeight="extrabold" color="gray.800">
              ¿Qué deseas realizar hoy?
            </Heading>
            <Text fontSize="sm" color="gray.500" maxW="lg">
              Selecciona una de las siguientes opciones para acceder a la carga de un nuevo donante o consultar y editar el listado existente.
            </Text>
          </VStack>

          {/* Grilla con las 2 Píldoras Grandes Premium */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="6">
            {/* Píldora 1: Nuevo Donante */}
            <GridItem>
              <Box
                role="button"
                tabIndex={0}
                onClick={() => navigate('/dashboard/donantes/nuevo')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate('/dashboard/donantes/nuevo');
                  }
                }}
                p="8"
                borderRadius="3xl"
                bg="linear-gradient(135deg, #0d9488 0%, #0f766e 100%)"
                color="white"
                cursor="pointer"
                position="relative"
                overflow="hidden"
                shadow="lg"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                  transform: 'translateY(-6px)',
                  shadow: '2xl',
                  filter: 'brightness(1.05)',
                }}
              >
                <VStack align="start" gap="4">
                  <HStack justify="space-between" w="100%">
                    <Box
                      p="3.5"
                      borderRadius="2xl"
                      bg="whiteAlpha.200"
                      backdropFilter="blur(8px)"
                      fontSize="2xl"
                    >
                      ✨
                    </Box>
                    <Badge
                      bg="whiteAlpha.300"
                      color="white"
                      borderRadius="full"
                      px="3"
                      py="1"
                      fontSize="xs"
                      fontWeight="bold"
                    >
                      Carga Rápida
                    </Badge>
                  </HStack>

                  <VStack align="start" gap="1.5">
                    <Heading as="h3" size="lg" fontWeight="bold">
                      Nuevo Donante
                    </Heading>
                    <Text fontSize="sm" color="whiteAlpha.900" lineHeight="tall">
                      Registra una persona física o jurídica mediante formulario interactivo o importa múltiples donantes a través de un archivo CSV / Excel.
                    </Text>
                  </VStack>

                  <HStack
                    gap="2"
                    fontSize="sm"
                    fontWeight="bold"
                    bg="white"
                    color="teal.800"
                    px="5"
                    py="2"
                    borderRadius="full"
                    shadow="sm"
                    mt="2"
                  >
                    <span>Ingresar a Nuevo Donante</span>
                    <span>→</span>
                  </HStack>
                </VStack>
              </Box>
            </GridItem>

            {/* Píldora 2: Lista de Donantes */}
            <GridItem>
              <Box
                role="button"
                tabIndex={0}
                onClick={() => navigate('/dashboard/donantes/lista')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate('/dashboard/donantes/lista');
                  }
                }}
                p="8"
                borderRadius="3xl"
                bg="linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
                color="white"
                cursor="pointer"
                position="relative"
                overflow="hidden"
                shadow="lg"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                  transform: 'translateY(-6px)',
                  shadow: '2xl',
                  filter: 'brightness(1.05)',
                }}
              >
                <VStack align="start" gap="4">
                  <HStack justify="space-between" w="100%">
                    <Box
                      p="3.5"
                      borderRadius="2xl"
                      bg="whiteAlpha.200"
                      backdropFilter="blur(8px)"
                      fontSize="2xl"
                    >
                      📋
                    </Box>
                    <Badge
                      bg="whiteAlpha.300"
                      color="white"
                      borderRadius="full"
                      px="3"
                      py="1"
                      fontSize="xs"
                      fontWeight="bold"
                    >
                      Padrón Completo
                    </Badge>
                  </HStack>

                  <VStack align="start" gap="1.5">
                    <Heading as="h3" size="lg" fontWeight="bold">
                      Lista de Donantes
                    </Heading>
                    <Text fontSize="sm" color="whiteAlpha.900" lineHeight="tall">
                      Explora la tabla interactiva, busca donantes por cualquier criterio en tiempo real, edita sus datos y gestiona bajas con modales de seguridad.
                    </Text>
                  </VStack>

                  <HStack
                    gap="2"
                    fontSize="sm"
                    fontWeight="bold"
                    bg="white"
                    color="gray.900"
                    px="5"
                    py="2"
                    borderRadius="full"
                    shadow="sm"
                    mt="2"
                  >
                    <span>Ver Tabla de Donantes</span>
                    <span>→</span>
                  </HStack>
                </VStack>
              </Box>
            </GridItem>
          </Grid>

          {/* Estadísticas de pie de tarjeta */}
          <Box
            p="5"
            borderRadius="2xl"
            bg="gray.50"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <HStack justify="space-around" wrap="wrap" gap="4" textAlign="center">
              <VStack gap="0.5" minW="100px">
                {isPending ? (
                  <Box h="32px" display="flex" alignItems="center" justifyContent="center">
                    <Spinner size="sm" colorPalette="teal" />
                  </Box>
                ) : (
                  <Text fontSize="2xl" fontWeight="extrabold" color="teal.600">
                    {donantes.length}
                  </Text>
                )}
                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                  Total de Donantes
                </Text>
              </VStack>

              <VStack gap="0.5" minW="100px">
                {isPending ? (
                  <Box h="32px" display="flex" alignItems="center" justifyContent="center">
                    <Spinner size="sm" colorPalette="blue" />
                  </Box>
                ) : (
                  <Text fontSize="2xl" fontWeight="extrabold" color="blue.600">
                    {humanasCount}
                  </Text>
                )}
                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                  Personas Físicas
                </Text>
              </VStack>

              <VStack gap="0.5" minW="100px">
                {isPending ? (
                  <Box h="32px" display="flex" alignItems="center" justifyContent="center">
                    <Spinner size="sm" colorPalette="purple" />
                  </Box>
                ) : (
                  <Text fontSize="2xl" fontWeight="extrabold" color="purple.600">
                    {juridicasCount}
                  </Text>
                )}
                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                  Personas Jurídicas
                </Text>
              </VStack>
            </HStack>
          </Box>
        </VStack>
      </Card.Root>
    </VStack>
  );
};

