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

/** Convierte "-34,6037" o "-34.6037" a número; vacío o inválido → null. */
const aNumero = (valor: string): number | null => {
  const n = parseFloat(valor.trim().replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

/** Vacío es válido (la ubicación es opcional); si hay valor, tiene que estar en rango. */
const coordenadaValida = (valor: string, limite: number): boolean => {
  if (!valor.trim()) return true;
  const n = aNumero(valor);
  return n !== null && Math.abs(n) <= limite;
};

export function RegistroEntidadPublico() {
  const [datos, setDatos] = useState(initial);
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [coordenadas, setCoordenadas] = useState({ latitud: '', longitud: '' });
  const [representantes, setRepresentantes] = useState([{ nombre: '', apellido: '', nroDocumento: '', email: '' }]);
  type CampoRepresentante = 'nombre' | 'apellido' | 'nroDocumento' | 'email';
  const updateRepresentante = (i: number, campo: CampoRepresentante, valor: string) =>
    setRepresentantes(lista => lista.map((r, j) => (j === i ? { ...r, [campo]: valor } : r)));
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const setAuth = useAuthStore(s => s.setAuth);
  const navigate = useNavigate();

  const update = (field: keyof RegistroEntidad, value: string) => setDatos(current => ({ ...current, [field]: value }));
  const updateDireccion = (field: keyof RegistroEntidad['direccion'], value: string) =>
    setDatos(current => ({ ...current, direccion: { ...current.direccion, [field]: value } }));

  function payload(): RegistroEntidad {
    const latitud = aNumero(coordenadas.latitud);
    const longitud = aNumero(coordenadas.longitud);
    const cargados = representantes
      .filter(r => r.nombre.trim() || r.apellido.trim() || r.email.trim())
      .map(r => ({ nombre: r.nombre.trim(), apellido: r.apellido.trim(), nroDocumento: Number(r.nroDocumento) || 0, email: r.email.trim() }));
    return { ...datos, representantes: cargados, direccion: { ...datos.direccion, latitud, longitud }, mediosDeContacto: [
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
    const incompletos = representantes.filter(r => r.nombre.trim() || r.apellido.trim() || r.email.trim())
      .some(r => !r.nombre.trim() || !r.apellido.trim() || !/^\S+@\S+\.\S+$/.test(r.email.trim()));
    if (incompletos) {
      setError('Cada representante necesita nombre, apellido y un correo válido.');
      return false;
    }
    if (!coordenadaValida(coordenadas.latitud, 90) || !coordenadaValida(coordenadas.longitud, 180)) {
      setError('Revisá la ubicación: la latitud va de -90 a 90 y la longitud de -180 a 180.');
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
                <Text fontSize="sm" color="gray.600" mt="5" mb="3">
                  Ubicación en el mapa (opcional). Sirve para mostrar tus entregas en el mapa público.
                  Podés copiarla de Google Maps: clic derecho sobre el lugar y elegí los dos números.
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                  <Field.Root><Field.Label>Latitud</Field.Label><Input inputMode="decimal" minH="12" borderRadius="xl" value={coordenadas.latitud} onChange={e => setCoordenadas(c => ({ ...c, latitud: e.target.value }))} placeholder="-34.6037" /></Field.Root>
                  <Field.Root><Field.Label>Longitud</Field.Label><Input inputMode="decimal" minH="12" borderRadius="xl" value={coordenadas.longitud} onChange={e => setCoordenadas(c => ({ ...c, longitud: e.target.value }))} placeholder="-58.3816" /></Field.Root>
                </SimpleGrid>
              </Box>
              <Box {...section}>
                <Heading as="h2" size="md" color="teal.800" mb="2">4. Representantes</Heading>
                <Text fontSize="sm" color="gray.600" mb="5">Personas de contacto de la entidad. Es opcional, pero si cargás uno completá nombre, apellido y correo.</Text>
                <Stack gap="5">
                  {representantes.map((r, i) => (
                    <SimpleGrid key={i} columns={{ base: 1, md: 2 }} gap="4" borderTopWidth={i ? '1px' : '0'} pt={i ? '5' : '0'}>
                      <Field.Root><Field.Label>Nombre</Field.Label><Input minH="12" borderRadius="xl" value={r.nombre} onChange={e => updateRepresentante(i, 'nombre', e.target.value)} /></Field.Root>
                      <Field.Root><Field.Label>Apellido</Field.Label><Input minH="12" borderRadius="xl" value={r.apellido} onChange={e => updateRepresentante(i, 'apellido', e.target.value)} /></Field.Root>
                      <Field.Root><Field.Label>Correo</Field.Label><Input type="email" minH="12" borderRadius="xl" value={r.email} onChange={e => updateRepresentante(i, 'email', e.target.value)} placeholder="nombre@entidad.org" /></Field.Root>
                      <Field.Root><Field.Label>DNI (opcional)</Field.Label><Input inputMode="numeric" minH="12" borderRadius="xl" value={r.nroDocumento} onChange={e => updateRepresentante(i, 'nroDocumento', e.target.value.replace(/\D/g, ''))} /></Field.Root>
                      {representantes.length > 1 && <Button type="button" variant="ghost" colorPalette="red" alignSelf="start" onClick={() => setRepresentantes(l => l.filter((_, j) => j !== i))}>Quitar representante</Button>}
                    </SimpleGrid>
                  ))}
                  <Button type="button" variant="outline" borderRadius="full" alignSelf="start" onClick={() => setRepresentantes(l => [...l, { nombre: '', apellido: '', nroDocumento: '', email: '' }])}>Agregar otro representante</Button>
                </Stack>
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
