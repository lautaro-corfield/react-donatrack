import { useEffect, useState } from 'react';
import { Badge, Button, Card, Field, Heading, Input, Stack, Text } from '@chakra-ui/react';
import { entidadesApi } from '../api/entidadesApi';
import type { Entidad, Necesidad } from '../model/types';

export function DirectorioEntidades() {
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [necesidades, setNecesidades] = useState<Record<number, Necesidad[]>>({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [emails, setEmails] = useState<Record<number, string>>({});
  const [accesoEstado, setAccesoEstado] = useState<Record<number, string>>({});
  const [guardandoAcceso, setGuardandoAcceso] = useState<number | null>(null);

  useEffect(() => {
    entidadesApi.listar().then(setEntidades).catch(() => setError('No se pudieron cargar las entidades.')).finally(() => setCargando(false));
  }, []);

  async function habilitarAcceso(entidadId: number) {
    setGuardandoAcceso(entidadId);
    setAccesoEstado(current => ({ ...current, [entidadId]: '' }));
    try {
      await entidadesApi.habilitarAcceso(entidadId, emails[entidadId] ?? '');
      setAccesoEstado(current => ({ ...current, [entidadId]: 'Acceso de entidad habilitado para ese correo de Google.' }));
    } catch (error) {
      const data = error && typeof error === 'object' && 'response' in error ? (error as { response?: { data?: unknown } }).response?.data : null;
      setAccesoEstado(current => ({ ...current, [entidadId]: typeof data === 'string' ? data : 'No se pudo vincular el correo.' }));
    } finally { setGuardandoAcceso(null); }
  }

  async function toggle(entidadId: number) {
    if (necesidades[entidadId]) {
      setNecesidades(current => { const next = { ...current }; delete next[entidadId]; return next; });
      return;
    }
    try {
      const lista = await entidadesApi.necesidadesDe(entidadId);
      setNecesidades(current => ({ ...current, [entidadId]: lista }));
    } catch { setError('No se pudieron cargar las necesidades de la entidad.'); }
  }

  return (
    <Stack gap="6" maxW="6xl" mx="auto" align="stretch">
      <Stack gap="1"><Heading as="h1" size="2xl">Entidades beneficiarias</Heading>
        <Text color="gray.600">Directorio de entidades registradas y necesidades declaradas.</Text></Stack>
      {error && <Text role="alert" color="red.600">{error}</Text>}
      {cargando ? <Text role="status">Cargando entidades…</Text> : entidades.length === 0 ? (
        <Card.Root bg="white" borderRadius="2xl"><Card.Body><Text color="gray.600">Todavía no hay entidades registradas.</Text></Card.Body></Card.Root>
      ) : entidades.map(entidad => {
        const datos = entidad.datosDeEntidad;
        const lista = necesidades[entidad.idEntidadBeneficiaria];
        return <Card.Root key={entidad.idEntidadBeneficiaria} bg="white" borderWidth="1px" borderRadius="2xl">
          <Card.Body>
            <Stack gap="4">
              <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }}>
                <Stack gap="1"><Heading size="md">{datos.razonSocial}</Heading>
                  <Text color="gray.600">{datos.tipo} · {datos.rubro || 'Sin rubro'} · CUIT {datos.cuit || '—'}</Text>
                  <Text fontSize="sm" color="gray.500">{datos.direccion?.calle1 ?? ''} {datos.direccion?.altura ?? ''}{datos.direccion?.ciudad?.nombre ? `, ${datos.direccion.ciudad.nombre}` : ''}</Text>
                </Stack>
                <Badge colorPalette="purple">{entidad.totalDonacionesRecibidas} entregas recibidas</Badge>
              </Stack>
              <Button type="button" variant="outline" colorPalette="teal" alignSelf="start" onClick={() => void toggle(entidad.idEntidadBeneficiaria)}>
                {lista ? 'Ocultar necesidades' : 'Ver necesidades'}
              </Button>
              <Stack as="form" direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'end' }} gap="3"
                onSubmit={event => { event.preventDefault(); void habilitarAcceso(entidad.idEntidadBeneficiaria); }}>
                <Field.Root required maxW={{ md: 'sm' }}>
                  <Field.Label>Correo de acceso con Google</Field.Label>
                  <Input type="email" value={emails[entidad.idEntidadBeneficiaria] ?? ''}
                    onChange={event => setEmails(current => ({ ...current, [entidad.idEntidadBeneficiaria]: event.target.value }))}
                    placeholder="contacto@entidad.org" />
                </Field.Root>
                <Button type="submit" colorPalette="purple" loading={guardandoAcceso === entidad.idEntidadBeneficiaria}>Habilitar acceso</Button>
              </Stack>
              {accesoEstado[entidad.idEntidadBeneficiaria] && <Text role="status" fontSize="sm" color={accesoEstado[entidad.idEntidadBeneficiaria].startsWith('Acceso') ? 'green.700' : 'red.700'}>{accesoEstado[entidad.idEntidadBeneficiaria]}</Text>}
              {lista && <Stack gap="2" pl="4" borderLeftWidth="2px" borderColor="teal.200">
                {lista.length ? lista.map(n => <Text key={n.id}>{n.subCategoriaNombre} · {n.cantidadCubierta}/{n.cantidadSolicitada} · {n.activa ? 'Activa' : n.estado}</Text>) : <Text color="gray.500">No tiene necesidades registradas.</Text>}
              </Stack>}
            </Stack>
          </Card.Body>
        </Card.Root>;
      })}
    </Stack>
  );
}
