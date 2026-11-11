import { Box, Button, Card, Container, Heading, HStack, Link as ChakraLink, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { GoogleLoginButton, useAuthStore } from '@/features/auth';
import { Form } from '../components/Form';
import { donantesApi } from '../api/donantesApi';
import type { AltaDonante } from '../model/types';

export function RegistroDonantePublico() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [datosPendientes, setDatosPendientes] = useState<{ tipo: 'humano' | 'juridico'; datos: AltaDonante; password: string } | null>(null);

  async function guardarDatos(tipo: 'humano' | 'juridico', datos: AltaDonante, password: string) {
    setDatosPendientes({ tipo, datos, password });
    return false;
  }

  async function registrarConGoogle(idToken: string) {
    if (!datosPendientes) return;
    const sesion = await donantesApi.registrarPublico(idToken, datosPendientes.tipo, datosPendientes.datos);
    setAuth(sesion.token, {
      ...sesion.user,
      id: String(sesion.user.id),
    });
    navigate('/dashboard/mi-actividad', { replace: true });
  }

  async function registrarConPassword() {
    if (!datosPendientes) return;
    setGuardando(true);
    setError('');
    try {
      await donantesApi.registrarConPassword(datosPendientes.tipo, datosPendientes.datos, datosPendientes.password);
      navigate('/login', { state: { email: correo, role: 'DONANTE' } });
    } catch (e) {
      const data = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: unknown } }).response?.data : undefined;
      setError(typeof data === 'string' ? data : 'No se pudo crear la cuenta. Revisá los datos.');
    } finally {
      setGuardando(false);
    }
  }

  const correo = datosPendientes?.datos.mediosDeContacto.find(contacto => contacto.medio === 'EMAIL')?.valor;

  return (
    <Box minH="100vh" bg="gray.50" py={{ base: '6', md: '10' }} px="4">
      <Container maxW="5xl">
        <Stack gap="6">
          <HStack justify="space-between" wrap="wrap" gap="3">
            <Stack gap="0">
              <Heading as="h1" size="xl" color="teal.700">DonaTrack</Heading>
              <Text color="gray.600">Creá tu cuenta de donante</Text>
            </Stack>
            <ChakraLink asChild color="teal.700" fontWeight="semibold">
              <RouterLink to="/login">Ya tengo cuenta</RouterLink>
            </ChakraLink>
          </HStack>

          <Card.Root borderWidth="1px" borderColor="gray.200" borderRadius="3xl" bg="white" shadow="sm">
            <Card.Header pb="2">
              <Card.Title>
                <Heading as="h2" size="lg">Registro de donante</Heading>
              </Card.Title>
              <Card.Description>Completá tus datos y elegí cómo ingresar.</Card.Description>
            </Card.Header>
            <Card.Body>
              <Stack gap="6">
                <Box display={datosPendientes ? 'none' : 'block'}>
                  <Form guardando={false} onSubmit={guardarDatos} />
                </Box>

                {datosPendientes && <Stack gap="4" role="status">
                  <Box borderWidth="1px" borderColor="teal.200" bg="teal.50" borderRadius="xl" p="4">
                    <Heading as="h3" size="sm" mb="1">Tus datos están listos</Heading>
                    <Text fontSize="sm" color="gray.700">
                      Elegí cómo ingresar con {correo ? <strong>{correo}</strong> : 'el correo indicado'}.
                    </Text>
                  </Box>
                  <Button disabled={guardando || datosPendientes.password.length < 8} onClick={registrarConPassword}>Registrarme con contraseña</Button>
                  <GoogleLoginButton onCredential={registrarConGoogle} buttonText="signup_with" />
                  {error && <Text role="alert" color="red.600">{error}</Text>}
                  <Button minH="12" minW="12" borderRadius="xl" variant="ghost" alignSelf="center" onClick={() => setDatosPendientes(null)}>
                    Editar mis datos
                  </Button>
                </Stack>}
              </Stack>
            </Card.Body>
            <Card.Footer justifyContent="center" borderTopWidth="1px" borderColor="gray.100">
              <Text fontSize="sm" color="gray.500">Solo se crean cuentas con rol de donante.</Text>
            </Card.Footer>
          </Card.Root>
        </Stack>
      </Container>
    </Box>
  );
}
