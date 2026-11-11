import { useState, type FormEvent } from 'react';
import { Box, Button, Card, Container, Field, Heading, HStack, Input, Link as ChakraLink, NativeSelect, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { GoogleLoginButton, useAuthStore } from '@/features/auth';
import { entidadesApi, type RegistroEntidad } from '../api/entidadesApi';

const initial: RegistroEntidad = {
  razonSocial: '', tipo: 'ONG', rubro: '', cuit: '',
  direccion: { calle1: '', altura: 0, sinAltura: false, ciudadNombre: '', provinciaNombre: '', paisNombre: 'Argentina' },
  mediosDeContacto: [{ medio: 'EMAIL', valor: '' }],
  medioPredeterminado: { medio: 'EMAIL', valor: '' },
};
const section = { borderWidth: '1px', borderColor: 'gray.200', borderRadius: '2xl', p: { base: '5', md: '7' }, boxShadow: 'sm' } as const;

export function RegistroEntidadPublico() {
  const [datos, setDatos] = useState(initial);
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const setAuth = useAuthStore(s => s.setAuth);
  const navigate = useNavigate();

  const update = (field: keyof RegistroEntidad, value: string) => setDatos(current => ({ ...current, [field]: value }));
  const updateDireccion = (field: keyof RegistroEntidad['direccion'], value: string) =>
    setDatos(current => ({ ...current, direccion: { ...current.direccion, [field]: value } }));

  function payload(): RegistroEntidad {
    return { ...datos, mediosDeContacto: [
      { medio: 'EMAIL', valor: datos.medioPredeterminado.valor },
      ...(telefono.trim() ? [{ medio: 'SMS' as const, valor: telefono.trim() }] : []),
    ] };
  }

  function validarDatos() {
    const obligatorios = [datos.razonSocial, datos.cuit, datos.rubro, datos.medioPredeterminado.valor,
      datos.direccion.calle1, datos.direccion.ciudadNombre, datos.direccion.provinciaNombre, datos.direccion.paisNombre];
    if (obligatorios.some(valor => !valor.trim()) || datos.direccion.altura <= 0) {
      setError('Completá los datos de la entidad, el correo institucional y la dirección.');
      return false;
    }
    return true;
  }

  async function registrarGoogle(token: string) {
    if (!validarDatos()) return;
    setGuardando(true); setError('');
    try {
      const response = await entidadesApi.registrarConGoogle(token, payload());
      setAuth(response.token, { ...response.user, id: String(response.user.id) });
      navigate('/dashboard/necesidades', { replace: true });
    } catch (e) { mostrarError(e); }
    finally { setGuardando(false); }
  }

  function mostrarError(e: unknown) {
    const data = e && typeof e === 'object' && 'response' in e
      ? (e as { response?: { data?: unknown } }).response?.data : undefined;
    setError(typeof data === 'string' ? data : 'No se pudo crear la cuenta. Revisá los datos.');
  }

  async function registrarConPassword() {
    if (!validarDatos()) return;
    if (password.length < 8 || password !== confirmacion) {
      setError('La contraseña debe tener al menos 8 caracteres y coincidir con la confirmación.');
      return;
    }
    setGuardando(true); setError('');
    try {
      await entidadesApi.registrarConPassword(payload(), password);
      navigate('/login', { state: { email: datos.medioPredeterminado.valor, role: 'ENTIDAD_BENEFICIARIA' } });
    } catch (e) { mostrarError(e); }
    finally { setGuardando(false); }
  }

  function siguiente(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (password && (password.length < 8 || password !== confirmacion)) {
      setError('La contraseña debe tener al menos 8 caracteres y coincidir con la confirmación.');
      return;
    }
    setError('');
    setPasoFinal(true);
  }
  const [pasoFinal, setPasoFinal] = useState(false);

  return <Box minH="100vh" bg="gray.50" py={{ base: '6', md: '10' }} px="4">
    <Container maxW="5xl">
      <Stack gap="6">
        <HStack justify="space-between" wrap="wrap" gap="3">
          <Stack gap="0"><Heading as="h1" size="xl" color="teal.700">DonaTrack</Heading><Text color="gray.600">Registro de entidad beneficiaria</Text></Stack>
          <ChakraLink asChild color="teal.700" fontWeight="semibold"><RouterLink to="/login">Ya tengo cuenta</RouterLink></ChakraLink>
        </HStack>
        <Card.Root bg="white" borderWidth="1px" borderRadius="3xl" shadow="sm">
          <Card.Header><Card.Title><Heading size="lg">Creá la cuenta de tu entidad</Heading></Card.Title><Card.Description>Ingresá el correo institucional y los datos de tu organización.</Card.Description></Card.Header>
          <Card.Body>
            <form onSubmit={siguiente}><Stack gap="7">
              <Box {...section}>
                <Heading as="h2" size="md" color="teal.800" mb="5">1. Tu cuenta</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                  <Field.Root required><Field.Label>Correo institucional</Field.Label><Input type="email" required minH="12" borderRadius="xl" autoComplete="email" value={datos.medioPredeterminado.valor} onChange={e => setDatos(s => ({ ...s, medioPredeterminado: { medio: 'EMAIL', valor: e.target.value }, mediosDeContacto: [{ medio: 'EMAIL', valor: e.target.value }] }))} placeholder="contacto@entidad.org" /></Field.Root>
                  <Box />
                  <Field.Root><Field.Label>Contraseña</Field.Label><Input type="password" minLength={8} minH="12" borderRadius="xl" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Al menos 8 caracteres" /></Field.Root>
                  <Field.Root><Field.Label>Confirmar contraseña</Field.Label><Input type="password" minH="12" borderRadius="xl" autoComplete="new-password" value={confirmacion} onChange={e => setConfirmacion(e.target.value)} placeholder="Repetí tu contraseña" /></Field.Root>
                </SimpleGrid>
                <Text color="gray.500" fontSize="sm" mt="3">Para registrarte con Google podés dejar la contraseña vacía.</Text>
              </Box>
              <Box {...section}>
                <Heading as="h2" size="md" color="teal.800" mb="5">2. Datos de la organización</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                  <Field.Root required><Field.Label>Razón social</Field.Label><Input required minH="12" borderRadius="xl" value={datos.razonSocial} onChange={e => update('razonSocial', e.target.value)} placeholder="Ej. Asociación Esperanza" /></Field.Root>
                  <Field.Root required><Field.Label>CUIT</Field.Label><Input required minH="12" borderRadius="xl" value={datos.cuit} onChange={e => update('cuit', e.target.value)} placeholder="30-12345678-9" /></Field.Root>
                  <Field.Root required><Field.Label>Tipo de organización</Field.Label><NativeSelect.Root><NativeSelect.Field minH="12" borderRadius="xl" value={datos.tipo} onChange={e => update('tipo', e.target.value)}><option value="ONG">ONG</option><option value="GUBERNAMENTAL">Gubernamental</option><option value="EMPRESA">Empresa</option><option value="INSTITUCION">Institución</option></NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root></Field.Root>
                  <Field.Root required><Field.Label>Rubro o población atendida</Field.Label><Input required minH="12" borderRadius="xl" value={datos.rubro} onChange={e => update('rubro', e.target.value)} placeholder="Ej. comedor comunitario" /></Field.Root>
                </SimpleGrid>
              </Box>
              <Box {...section}>
                <Heading as="h2" size="md" color="teal.800" mb="5">3. Contacto y domicilio</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                  <Field.Root><Field.Label>Teléfono / Móvil</Field.Label><Input type="tel" minH="12" borderRadius="xl" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Ej. +54 11 4455-6677" /></Field.Root>
                  <Field.Root required><Field.Label>Calle</Field.Label><Input required minH="12" borderRadius="xl" value={datos.direccion.calle1} onChange={e => updateDireccion('calle1', e.target.value)} placeholder="Av. Siempre Viva" /></Field.Root>
                  <Field.Root required><Field.Label>Altura</Field.Label><Input required type="number" min="1" minH="12" borderRadius="xl" value={datos.direccion.altura || ''} onChange={e => setDatos(current => ({ ...current, direccion: { ...current.direccion, altura: Number(e.target.value) } }))} placeholder="742" /></Field.Root>
                  <Field.Root required><Field.Label>Ciudad</Field.Label><Input required minH="12" borderRadius="xl" value={datos.direccion.ciudadNombre} onChange={e => updateDireccion('ciudadNombre', e.target.value)} placeholder="Ciudad" /></Field.Root>
                  <Field.Root required><Field.Label>Provincia</Field.Label><Input required minH="12" borderRadius="xl" value={datos.direccion.provinciaNombre} onChange={e => updateDireccion('provinciaNombre', e.target.value)} placeholder="Provincia" /></Field.Root>
                  <Field.Root required><Field.Label>País</Field.Label><Input required minH="12" borderRadius="xl" value={datos.direccion.paisNombre} onChange={e => updateDireccion('paisNombre', e.target.value)} /></Field.Root>
                </SimpleGrid>
              </Box>
              {error && <Text role="alert" color="red.600">{error}</Text>}
              {!pasoFinal ? <Button type="submit" alignSelf="end" borderRadius="full" colorPalette="teal" minH="12">Continuar</Button> : <Stack align="end" gap="3">
                <HStack gap="3" wrap="wrap"><Button type="button" variant="outline" borderRadius="full" onClick={() => setPasoFinal(false)}>Editar datos</Button><Button type="button" borderRadius="full" colorPalette="teal" disabled={guardando || password.length < 8} onClick={registrarConPassword}>Registrarme con contraseña</Button></HStack>
                <GoogleLoginButton buttonText="signup_with" onCredential={registrarGoogle} />
              </Stack>}
            </Stack></form>
          </Card.Body>
        </Card.Root>
      </Stack>
    </Container>
  </Box>;
}
