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
  const [datosPendientes, setDatosPendientes] = useState<{ tipo: 'humano' | 'juridico'; datos: AltaDonante } | null>(null);

  async function guardarDatos(tipo: 'humano' | 'juridico', datos: AltaDonante) {
    setDatosPendientes({ tipo, datos });
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

  const correo = datosPendientes?.datos.mediosDeContacto.find(contacto => contacto.medio === 'EMAIL')?.valor;

  return (
    <Box minH="100vh" bg="gray.50" py={{ base: '6', md: '10' }} px="4">
      <Container maxW="3xl">
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

          <Card.Root borderWidth="1px" borderColor="gray.200" borderRadius="2xl" bg="white" shadow="sm">
            <Card.Header pb="2">
              <Card.Title>
                <Heading as="h2" size="lg">Registro de donante</Heading>
              </Card.Title>
              <Card.Description>Completá tus datos y verificá tu correo con Google. La cuenta se activa al terminar el registro.</Card.Description>
            </Card.Header>
            <Card.Body>
              <Stack gap="6">
                <Box display={datosPendientes ? 'none' : 'block'}>
                  <Form guardando={false} onSubmit={guardarDatos} etiquetaFinal="Continuar con Google" />
                </Box>

                {datosPendientes && <Stack gap="4" role="status">
                  <Box borderWidth="1px" borderColor="teal.200" bg="teal.50" borderRadius="xl" p="4">
                    <Heading as="h3" size="sm" mb="1">Tus datos están listos</Heading>
                    <Text fontSize="sm" color="gray.700">
                      Continuá con Google usando {correo ? <strong>{correo}</strong> : 'el correo indicado'} para verificar que la cuenta sea tuya.
                    </Text>
                  </Box>
                  <GoogleLoginButton onCredential={registrarConGoogle} buttonText="signup_with" />
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
