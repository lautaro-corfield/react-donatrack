import { useState, type FormEvent } from 'react';
import { Box, Button, Field, Input, Stack, Text } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { EstadoConsulta } from '@/features/donantes/components/EstadoConsulta';
import { control, panel } from '@/features/donantes/components/styles';
import { useConsulta } from '@/features/donantes/model/useConsulta';
import { logisticaApi, mensajeLogistica } from '../api/logisticaApi';

export function AdministradoresLogistica() {
  const consulta = useConsulta(logisticaApi.cuentas);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  async function autorizar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get('email'));
    setGuardando(true);
    setError('');
    setMensaje('');
    try {
      await logisticaApi.autorizar(email);
      form.reset();
      setMensaje('Correo autorizado. La persona ya puede activar su cuenta desde el ingreso del equipo.');
      consulta.recargar();
    } catch (err) {
      setError(mensajeLogistica(err, 'No se pudo autorizar el correo.'));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Stack gap="6" maxW="4xl" mx="auto">
      <PageHeader title="Administradores de Logística" subtitle="Autorizá el correo con el que la persona va a activar su cuenta." />
      <Box {...panel} as="section">
        <form onSubmit={autorizar}>
          <Stack gap="3">
            <Field.Root required>
              <Field.Label>Correo electrónico</Field.Label>
              <Input {...control} name="email" type="email" autoComplete="email" required />
            </Field.Root>
            <Button {...control} type="submit" colorPalette="teal" alignSelf="start" loading={guardando}>Autorizar correo</Button>
          </Stack>
        </form>
        {mensaje && <Text role="status" color="green.700" mt="3">{mensaje}</Text>}
        {error && <Text role="alert" color="red.700" mt="3">{error}</Text>}
      </Box>
      <Stack {...panel} gap="3">
        {!consulta.datos ? <EstadoConsulta {...consulta} /> : consulta.datos.length === 0 ?
          <Text>Todavía no hay correos autorizados.</Text> :
          consulta.datos.map(cuenta => <Text key={cuenta.email}>{cuenta.email} · {cuenta.activa ? 'Activa' : 'Pendiente de activación'}</Text>)}
      </Stack>
    </Stack>
  );
}

export function ActivarCuentaLogistica() {
  const navigate = useNavigate();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  async function activar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const datos = new FormData(event.currentTarget);
    const email = String(datos.get('email'));
    setGuardando(true);
    setError('');
    try {
      await logisticaApi.activar(email, String(datos.get('password')));
      navigate('/login/admin', { replace: true, state: { email, logisticaActivada: true } });
    } catch (err) {
      setError(mensajeLogistica(err, 'No se pudo activar la cuenta.'));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Box bg="gray.50" minH="100dvh" px="4" py={{ base: '8', md: '16' }}>
      <Stack {...panel} maxW="lg" mx="auto" gap="6">
        <PageHeader title="Activar cuenta de Logística" subtitle="Usá el correo autorizado por administración." />
        <form onSubmit={activar}>
          <Stack gap="4">
            <Field.Root required>
              <Field.Label>Correo electrónico</Field.Label>
              <Input {...control} name="email" type="email" autoComplete="email" required />
            </Field.Root>
            <Field.Root required>
              <Field.Label>Contraseña</Field.Label>
              <Input {...control} name="password" type="password" minLength={8} maxLength={72} autoComplete="new-password" required />
              <Field.HelperText>Al menos 8 caracteres.</Field.HelperText>
            </Field.Root>
            {error && <Text role="alert" color="red.700">{error}</Text>}
            <Button {...control} colorPalette="teal" type="submit" loading={guardando}>Activar cuenta</Button>
          </Stack>
        </form>
        <Button {...control} asChild variant="ghost"><Link to="/login/admin">Volver al ingreso del equipo</Link></Button>
      </Stack>
    </Box>
  );
}
