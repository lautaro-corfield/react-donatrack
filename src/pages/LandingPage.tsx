import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Image,
  Link as ChakraLink,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';
import { DonacionesDestacadas } from '@/features/publico/components/DonacionesDestacadas';
import { MapaEntregas } from '@/features/publico/components/MapaEntregas';

const PASOS = [
  {
    titulo: 'Donás en el depósito',
    texto:
      'Acercate al depósito con tus bienes. Un administrador registra la donación y el sistema la segmenta automáticamente.',
  },
  {
    titulo: 'La asignamos a quien la necesita',
    texto:
      'El sistema vincula cada donación con la entidad beneficiaria que más la necesita según sus necesidades registradas.',
  },
  {
    titulo: 'Seguís su recorrido',
    texto: 'Recibí avisos por email, teléfono o WhatsApp cuando tu donación es asignada, enviada o entregada.',
  },
  {
    titulo: 'Las entidades piden lo que necesitan',
    texto:
      'Comedores, escuelas y hogares registran sus necesidades concretas para recibir lo que realmente necesitan.',
  },
  {
    titulo: 'Donar tiene recompensas',
    texto: 'Completá misiones, ganá insignias y subí de categoría.',
  },
];

const Seccion = ({
  id,
  titulo,
  subtitulo,
  children,
}: {
  id: string;
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}) => (
  <Box as="section" id={id} aria-labelledby={`${id}-titulo`} py={{ base: '10', md: '14' }}>
    <Container maxW="6xl">
      <VStack align="start" gap="2" mb="6">
        <Heading as="h2" id={`${id}-titulo`} size="xl" color="gray.800">
          {titulo}
        </Heading>
        {subtitulo && <Text color="gray.600">{subtitulo}</Text>}
      </VStack>
      {children}
    </Container>
  </Box>
);

/**
 * Landing pública de DonaTrack: propósito, donaciones del último mes, mapa de
 * entregas, accesos a registro e inicio de sesión, e información legal.
 */
export const LandingPage = () => {
  // Con sesión iniciada, el acceso principal lleva al panel en vez de al login.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Box bg="white" minH="100vh">
      <Box as="header" borderBottomWidth="1px" position="sticky" top="0" bg="white" zIndex="10">
        <Container maxW="6xl">
          <Flex h="16" align="center" justify="space-between" gap="4">
            <HStack gap="2">
              <Image src="/donatrack.jpeg" alt="" boxSize="36px" borderRadius="md" />
              <Text fontWeight="extrabold" fontSize="lg" color="teal.700">
                DonaTrack
              </Text>
            </HStack>
            <HStack as="nav" aria-label="Navegación principal" gap={{ base: '2', md: '6' }}>
              <HStack gap="6" display={{ base: 'none', md: 'flex' }}>
                <ChakraLink href="#como-funciona" color="gray.700">Cómo funciona</ChakraLink>
                <ChakraLink href="#donaciones" color="gray.700">Donaciones</ChakraLink>
                <ChakraLink href="#mapa" color="gray.700">Mapa</ChakraLink>
              </HStack>
              {isAuthenticated ? (
                <Button asChild colorPalette="teal" size="sm" minH="48px">
                  <RouterLink to="/dashboard">Ir a mi panel</RouterLink>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm" minH="48px">
                    <RouterLink to="/login">Iniciar sesión</RouterLink>
                  </Button>
                  <Button asChild colorPalette="teal" size="sm" minH="48px">
                    <RouterLink to="/registro/donante">Registrarse</RouterLink>
                  </Button>
                </>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Box as="main">
        <Box bg="teal.50" py={{ base: '14', md: '20' }}>
          <Container maxW="4xl" textAlign="center">
            <Heading as="h1" size={{ base: '2xl', md: '4xl' }} color="gray.900" lineHeight="1.2">
              Cada donación cuenta.
              <br />
              Cada entrega se rastrea.
            </Heading>
            <Text mt="5" fontSize={{ base: 'md', md: 'lg' }} color="gray.700" maxW="2xl" mx="auto">
              DonaTrack conecta personas donantes con entidades beneficiarias, garantizando
              transparencia y trazabilidad en todo el proceso.
            </Text>
            <Stack direction={{ base: 'column', sm: 'row' }} gap="3" justify="center" mt="8">
              <Button asChild colorPalette="teal" size="lg" minH="48px">
                <RouterLink to="/registro/donante">Quiero donar</RouterLink>
              </Button>
              <Button asChild variant="outline" colorPalette="teal" size="lg" minH="48px">
                <RouterLink to="/registro/entidad">Soy entidad beneficiaria</RouterLink>
              </Button>
            </Stack>
          </Container>
        </Box>

        <Seccion
          id="como-funciona"
          titulo="¿Cómo funciona DonaTrack?"
          subtitulo="Un proceso simple y transparente de principio a fin"
        >
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="5">
            {PASOS.map((p, i) => (
              <Box key={p.titulo} p="5" borderWidth="1px" borderRadius="xl">
                <Text fontSize="sm" fontWeight="bold" color="teal.600">Paso {i + 1}</Text>
                <Heading as="h3" size="md" mt="1" mb="2">{p.titulo}</Heading>
                <Text color="gray.600" fontSize="sm">{p.texto}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Seccion>

        <Box bg="gray.50">
          <Seccion
            id="donaciones"
            titulo="Donaciones del último mes"
            subtitulo="Entregas reales gestionadas por DonaTrack en los últimos 30 días"
          >
            <DonacionesDestacadas />
          </Seccion>
        </Box>

        <Seccion
          id="mapa"
          titulo="Mapa de entregas realizadas"
          subtitulo="Tocá cada marcador para ver los detalles de la donación entregada"
        >
          <MapaEntregas />
        </Seccion>

        <Box bg="teal.700" color="white" py="14">
          <Container maxW="3xl" textAlign="center">
            <Heading as="h2" size="xl">¿Listo para hacer la diferencia?</Heading>
            <Text mt="3" color="teal.50">
              Unite a DonaTrack y ayudá a que cada donación llegue a quien más la necesita.
            </Text>
            <Button asChild mt="6" size="lg" bg="white" color="teal.800" minH="48px">
              <RouterLink to="/registro/donante">Crear mi cuenta</RouterLink>
            </Button>
          </Container>
        </Box>
      </Box>

      <Box as="footer" py="8" borderTopWidth="1px">
        <Container maxW="6xl">
          <Stack
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            gap="3"
          >
            <Text fontSize="sm" color="gray.600">
              DonaTrack © {new Date().getFullYear()} · UTN Solidaria
            </Text>
            <HStack as="nav" aria-label="Información legal" gap="5" fontSize="sm">
              <ChakraLink asChild color="gray.700">
                <RouterLink to="/legal">Información legal</RouterLink>
              </ChakraLink>
              <ChakraLink asChild color="gray.700">
                <RouterLink to="/privacidad">Política de privacidad</RouterLink>
              </ChakraLink>
            </HStack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};
