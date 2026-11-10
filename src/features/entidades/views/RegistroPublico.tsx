import { useState } from 'react';
import { Box, Button, Card, Container, Field, Heading, HStack, Input, Link as ChakraLink, NativeSelect, Stack, Steps, Text } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { GoogleLoginButton, useAuthStore } from '@/features/auth';
import { entidadesApi, type RegistroEntidad } from '../api/entidadesApi';

const initial: RegistroEntidad = {
  razonSocial: '', tipo: 'ONG', rubro: '', cuit: '',
  direccion: { calle1: '', altura: 0, sinAltura: false, ciudadNombre: '', provinciaNombre: '', paisNombre: 'Argentina' },
  mediosDeContacto: [{ medio: 'EMAIL', valor: '' }],
  medioPredeterminado: { medio: 'EMAIL', valor: '' },
};

export function RegistroEntidadPublico() {
  const [datos, setDatos] = useState(initial);
  const [paso, setPaso] = useState(0);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const setAuth = useAuthStore(s => s.setAuth);
  const navigate = useNavigate();

  const update = (field: keyof RegistroEntidad, value: string) =>
    setDatos(current => ({ ...current, [field]: value }));
  const updateDireccion = (field: keyof RegistroEntidad['direccion'], value: string) =>
    setDatos(current => ({ ...current, direccion: { ...current.direccion, [field]: value } }));

  async function registrar(token: string) {
    const obligatorios = [
      datos.razonSocial, datos.cuit, datos.rubro, datos.medioPredeterminado.valor,
      datos.direccion.calle1, datos.direccion.ciudadNombre,
      datos.direccion.provinciaNombre, datos.direccion.paisNombre,
    ];
    if (obligatorios.some(valor => !valor.trim()) || datos.direccion.altura <= 0) {
      setError('Completá los datos de la entidad, el correo institucional y la dirección antes de continuar.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      const response = await entidadesApi.registrarConGoogle(token, datos);
      setAuth(response.token, { ...response.user, id: String(response.user.id) });
      navigate('/dashboard/necesidades', { replace: true });
    } catch (e) {
      const data = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: unknown } }).response?.data : undefined;
      setError(typeof data === 'string' ? data : 'No se pudo registrar la entidad. Revisá los datos y el correo de Google.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Box minH="100vh" bg="gray.50" py={{ base: '6', md: '10' }} px="4">
      <Container maxW="3xl">
        <Stack gap="6">
          <HStack justify="space-between" wrap="wrap" gap="3">
            <Stack gap="0">
              <Heading as="h1" size="xl" color="teal.700">DonaTrack</Heading>
              <Text color="gray.600">Registro de entidad beneficiaria</Text>
            </Stack>
            <ChakraLink asChild color="teal.700" fontWeight="semibold">
              <RouterLink to="/login">Ya tengo cuenta</RouterLink>
            </ChakraLink>
          </HStack>
          <Card.Root bg="white" borderWidth="1px" borderRadius="2xl">
            <Card.Header>
              <Card.Title><Heading size="lg">Creá la cuenta de tu entidad</Heading></Card.Title>
              <Card.Description>Usá el mismo correo de Google que cargues como contacto institucional.</Card.Description>
            </Card.Header>
            <Card.Body>
              <Stack gap="4">
                <Steps.Root count={3} step={paso} onStepChange={({ step }) => setPaso(step)} linear colorPalette="green" size="sm">
                  <Steps.List>
                    {['Organización', 'Contacto', 'Dirección'].map((titulo, index) => (
                      <Steps.Item key={titulo} index={index}>
                        <Steps.Trigger disabled={index > paso}>
                          <Steps.Indicator /><Steps.Title>{titulo}</Steps.Title>
                        </Steps.Trigger>
                        {index < 2 && <Steps.Separator />}
                      </Steps.Item>
                    ))}
                  </Steps.List>
                </Steps.Root>
                <Text fontWeight="semibold" color="gray.700">Paso {paso + 1} de 3: {['Organización', 'Contacto', 'Dirección'][paso]}</Text>
                <Stack as="form" gap="4" onSubmit={event => {
                  event.preventDefault();
                  if ((event.currentTarget as unknown as HTMLFormElement).reportValidity()) setPaso(current => Math.min(2, current + 1));
                }}>
                {paso === 0 && <>
                <Field.Root required>
                  <Field.Label>Razón social</Field.Label>
                  <Input required value={datos.razonSocial} onChange={e => update('razonSocial', e.target.value)} placeholder="Ej. Asociación Esperanza" />
                </Field.Root>
                <Stack direction={{ base: 'column', md: 'row' }} gap="4">
                  <Field.Root required flex="1">
                    <Field.Label>Tipo de organización</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field value={datos.tipo} onChange={e => update('tipo', e.target.value)}>
                        <option value="ONG">ONG</option><option value="GUBERNAMENTAL">Gubernamental</option>
                        <option value="EMPRESA">Empresa</option><option value="INSTITUCION">Institución</option>
                      </NativeSelect.Field><NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>
                  <Field.Root required flex="1">
                    <Field.Label>CUIT</Field.Label>
                    <Input required value={datos.cuit} onChange={e => update('cuit', e.target.value)} placeholder="30-12345678-9" />
                  </Field.Root>
                </Stack>
                <Field.Root required>
                  <Field.Label>Rubro o población atendida</Field.Label>
                  <Input required value={datos.rubro} onChange={e => update('rubro', e.target.value)} placeholder="Ej. comedor comunitario" />
                </Field.Root>
                </>}
                {paso === 1 && <Field.Root required>
                  <Field.Label>Correo institucional (Google)</Field.Label>
                  <Input type="email" required value={datos.medioPredeterminado.valor}
                    onChange={e => setDatos(s => ({ ...s, medioPredeterminado: { medio: 'EMAIL', valor: e.target.value },
                      mediosDeContacto: [{ medio: 'EMAIL', valor: e.target.value }] }))} placeholder="contacto@entidad.org" />
                </Field.Root>}
                {paso === 2 && <>
                <Heading size="sm" pt="2">Dirección</Heading>
                <Stack direction={{ base: 'column', md: 'row' }} gap="4">
                  <Field.Root required flex="2"><Field.Label>Calle</Field.Label><Input required value={datos.direccion.calle1} onChange={e => updateDireccion('calle1', e.target.value)} placeholder="Av. Siempre Viva" /></Field.Root>
                  <Field.Root required flex="1"><Field.Label>Altura</Field.Label><Input type="number" value={datos.direccion.altura || ''} onChange={e => setDatos(current => ({ ...current, direccion: { ...current.direccion, altura: Number(e.target.value) } }))} placeholder="742" /></Field.Root>
                </Stack>
                <Stack direction={{ base: 'column', md: 'row' }} gap="4">
                  <Field.Root required flex="1"><Field.Label>Ciudad</Field.Label><Input required value={datos.direccion.ciudadNombre} onChange={e => updateDireccion('ciudadNombre', e.target.value)} placeholder="Ciudad" /></Field.Root>
                  <Field.Root required flex="1"><Field.Label>Provincia</Field.Label><Input required value={datos.direccion.provinciaNombre} onChange={e => updateDireccion('provinciaNombre', e.target.value)} placeholder="Provincia" /></Field.Root>
                  <Field.Root required flex="1"><Field.Label>País</Field.Label><Input required value={datos.direccion.paisNombre} onChange={e => updateDireccion('paisNombre', e.target.value)} /></Field.Root>
                </Stack>
                </>}
                {error && <Text role="alert" color="red.600">{error}</Text>}
                <HStack justify="space-between" wrap="wrap" gap="3">
                  <Button type="button" variant="outline" disabled={paso === 0} onClick={() => setPaso(current => Math.max(0, current - 1))}>Anterior</Button>
                  {paso < 2
                    ? <Button type="submit" colorPalette="teal">Continuar</Button>
                    : <GoogleLoginButton buttonText="signup_with" onCredential={registrar} />}
                </HStack>
                {guardando && <Text role="status">Creando la cuenta…</Text>}
                </Stack>
              </Stack>
            </Card.Body>
          </Card.Root>
        </Stack>
      </Container>
    </Box>
  );
}
