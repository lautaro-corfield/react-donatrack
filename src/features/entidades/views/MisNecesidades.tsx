import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Card, Field, Heading, Input, NativeSelect, Stack, Text } from '@chakra-ui/react';
import { entidadesApi } from '../api/entidadesApi';
import type { CrearNecesidad, Necesidad } from '../model/types';

const hoy = new Date().toISOString().slice(0, 10);
const vacia: CrearNecesidad = { subCategoriaNombre: '', cantidad: 1, fechaLimite: hoy, tipoNecesidad: 'RECURRENTE', diasRecurrencia: 30 };

export function MisNecesidades() {
  const [necesidades, setNecesidades] = useState<Necesidad[]>([]);
  const [form, setForm] = useState(vacia);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    try { setNecesidades(await entidadesApi.misNecesidades()); }
    catch { setError('No se pudieron cargar tus necesidades.'); }
    finally { setCargando(false); }
  }, []);
  useEffect(() => { void Promise.resolve().then(cargar); }, [cargar]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true); setError('');
    try {
      await entidadesApi.crearNecesidad(form);
      setForm(vacia);
      await cargar();
    } catch (err) {
      const data = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: unknown } }).response?.data : null;
      setError(typeof data === 'string' ? data : 'No se pudo guardar la necesidad.');
    } finally { setGuardando(false); }
  }

  return (
    <Stack gap="6" maxW="5xl" mx="auto" align="stretch">
      <Stack gap="1">
        <Heading as="h1" size="2xl">Necesidades de mi entidad</Heading>
        <Text color="gray.600">Registrá los bienes que necesitan. Las recurrentes se renuevan automáticamente cada período.</Text>
      </Stack>
      <Card.Root bg="white" borderWidth="1px" borderRadius="2xl">
        <Card.Header><Card.Title><Heading size="md">Cargar necesidad</Heading></Card.Title></Card.Header>
        <Card.Body>
          <Stack as="form" onSubmit={guardar} gap="4">
            <Field.Root required>
              <Field.Label>Subcategoría del bien</Field.Label>
              <Input value={form.subCategoriaNombre} onChange={e => setForm(v => ({ ...v, subCategoriaNombre: e.target.value }))} placeholder="Ej. Leche larga vida" />
            </Field.Root>
            <Stack direction={{ base: 'column', md: 'row' }} gap="4">
              <Field.Root required flex="1">
                <Field.Label>Cantidad solicitada</Field.Label>
                <Input type="number" min="1" value={form.cantidad} onChange={e => setForm(v => ({ ...v, cantidad: Number(e.target.value) }))} />
              </Field.Root>
              <Field.Root required flex="1">
                <Field.Label>Tipo de necesidad</Field.Label>
                <NativeSelect.Root>
                  <NativeSelect.Field value={form.tipoNecesidad} onChange={e => setForm(v => ({ ...v, tipoNecesidad: e.target.value as CrearNecesidad['tipoNecesidad'] }))}>
                    <option value="RECURRENTE">Recurrente</option><option value="EXTRAORDINARIA">Extraordinaria</option>
                  </NativeSelect.Field><NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
              <Field.Root required flex="1">
                <Field.Label>{form.tipoNecesidad === 'RECURRENTE' ? 'Fecha del próximo período' : 'Fecha límite'}</Field.Label>
                <Input type="date" min={hoy} value={form.fechaLimite} onChange={e => setForm(v => ({ ...v, fechaLimite: e.target.value }))} />
              </Field.Root>
            </Stack>
            {form.tipoNecesidad === 'RECURRENTE' ? (
              <Field.Root required maxW="sm"><Field.Label>Frecuencia en días</Field.Label>
                <Input type="number" min="1" value={form.diasRecurrencia} onChange={e => setForm(v => ({ ...v, diasRecurrencia: Number(e.target.value) }))} />
              </Field.Root>
            ) : (
              <Field.Root required><Field.Label>Motivo extraordinario</Field.Label>
                <Input value={form.causa ?? ''} onChange={e => setForm(v => ({ ...v, causa: e.target.value }))} placeholder="Describí brevemente la necesidad" />
              </Field.Root>
            )}
            {error && <Text role="alert" color="red.600">{error}</Text>}
            <Button type="submit" colorPalette="teal" minH="12" alignSelf="start" loading={guardando}>Guardar necesidad</Button>
          </Stack>
        </Card.Body>
      </Card.Root>
      <Stack gap="3">
        <Heading size="md">Historial de necesidades</Heading>
        {cargando ? <Text role="status">Cargando necesidades…</Text> : necesidades.length === 0 ? (
          <Text color="gray.600">Todavía no cargaste necesidades.</Text>
        ) : necesidades.map((n) => (
          <Card.Root key={n.id} bg="white" borderWidth="1px" borderRadius="xl">
            <Card.Body>
              <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }}>
                <Stack gap="1"><Heading size="sm">{n.subCategoriaNombre}</Heading>
                  <Text fontSize="sm" color="gray.600">{n.cantidadCubierta} de {n.cantidadSolicitada} cubiertas · {n.tipoNecesidad === 'RECURRENTE' ? `cada ${n.diasRecurrencia} días` : n.causa}</Text>
                </Stack>
                <Badge colorPalette={n.activa ? 'teal' : 'gray'}>{n.activa ? 'Activa' : n.estado}</Badge>
              </Stack>
            </Card.Body>
          </Card.Root>
        ))}
      </Stack>
    </Stack>
  );
}
