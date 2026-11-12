import { useState, type FormEvent } from 'react';
import { Badge, Box, Button, Field, Heading, HStack, NativeSelect, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { isAxiosError } from 'axios';
import { useAuthStore } from '@/features/auth';
import { EstadoConsulta } from '@/features/donantes/components/EstadoConsulta';
import { control, panel } from '@/features/donantes/components/styles';
import { useConsulta } from '@/features/donantes/model/useConsulta';
import { PageHeader } from '@/shared/components/PageHeader';
import { logisticaApi, mensajeLogistica } from '../api/logisticaApi';
import type { CrearRuta, SegmentoLogistico } from '../model/types';
import { AltaRecurso } from './AltaRecurso';

const etapas = ['Ruta preparada', 'En traslado', 'En destino', 'Entrega confirmada'];

function paso(segmento: SegmentoLogistico) {
  if (segmento.estado === 'ENTREGADA') return 3;
  if (segmento.llegada) return 2;
  return segmento.estado === 'EN_TRASLADO' ? 1 : 0;
}

function Progreso({ segmento }: { segmento: SegmentoLogistico }) {
  const actual = paso(segmento);
  return (
    <Stack as="ol" aria-label="Progreso del envío" listStyle="none" gap="0"
      direction={{ base: 'column', sm: 'row' }} align="stretch">
      {etapas.map((etapa, indice) => (
        <Box as="li" key={etapa} aria-current={indice === actual ? 'step' : undefined} position="relative" flex="1"
          minH={{ base: '9', sm: 'auto' }} color={indice <= actual ? 'teal.800' : 'gray.600'}>
          {indice < etapas.length - 1 && (
            <Box aria-hidden position="absolute" bg={indice < actual ? 'teal.500' : 'gray.200'}
              top="2" left={{ base: '7px', sm: '2' }} w={{ base: '2px', sm: 'full' }} h={{ base: 'full', sm: '2px' }} />
          )}
          <Stack direction={{ base: 'row', sm: 'column' }} align={{ base: 'center', sm: 'start' }} gap="2" position="relative">
            <Box aria-hidden w="4" h="4" flexShrink="0" borderWidth="2px" borderRadius="full"
              borderColor={indice <= actual ? 'teal.600' : 'gray.300'} bg={indice <= actual ? 'teal.600' : 'white'} />
            <Text fontSize="sm" fontWeight={indice === actual ? 'bold' : 'normal'}>{etapa}</Text>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

function leerPendiente(clave: string): CrearRuta | null {
  try {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : null;
  } catch {
    return null;
  }
}

export function PanelLogistica() {
  const email = useAuthStore(state => state.user?.email);
  const clave = `donatrack:ruta-pendiente:${email}`;
  const [pendiente, setPendiente] = useState(() => leerPendiente(clave));
  const [alta, setAlta] = useState<'chofer' | 'camion' | null>(null);
  const [enCurso, setEnCurso] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const camiones = useConsulta(logisticaApi.camiones);
  const choferes = useConsulta(logisticaApi.choferes);
  const segmentos = useConsulta(logisticaApi.segmentos);
  const rutas = useConsulta(logisticaApi.rutas);

  async function operar(id: string, accion: () => Promise<unknown>, exito: string) {
    setEnCurso(id);
    setError('');
    setMensaje('');
    try {
      await accion();
      setMensaje(exito);
    } catch (err) {
      setError(mensajeLogistica(err, 'No se pudo completar la operación. Volvé a intentar.'));
    } finally {
      rutas.recargar();
      segmentos.recargar();
      setEnCurso('');
    }
  }

  function guardarPendiente(datos: CrearRuta | null) {
    setPendiente(datos);
    if (datos) localStorage.setItem(clave, JSON.stringify(datos));
    else localStorage.removeItem(clave);
  }

  function crearRuta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formulario = event.currentTarget;
    const datos = new FormData(formulario);
    const seleccion = pendiente ?? {
      solicitudId: crypto.randomUUID(),
      camionId: String(datos.get('camionId') ?? ''),
      choferId: String(datos.get('choferId') ?? ''),
      segmentoIds: datos.getAll('segmento').map(Number),
    };
    if (!seleccion.camionId || !seleccion.choferId) {
      setError('Seleccioná un chofer y un camión.');
      return;
    }
    if (seleccion.segmentoIds.length === 0) {
      setError('Seleccioná al menos un segmento.');
      return;
    }
    void operar('crear', async () => {
      guardarPendiente(seleccion);
      try {
        await logisticaApi.crearRuta(seleccion);
      } catch (err) {
        const status = isAxiosError(err) ? err.response?.status : undefined;
        if (status === 400 || status === 409) guardarPendiente(null);
        throw err;
      }
      guardarPendiente(null);
      formulario.reset();
    }, 'Ruta preparada.');
  }

  function abrirAlta(tipo: 'chofer' | 'camion') {
    setAlta(tipo);
    requestAnimationFrame(() => {
      const seccion = document.getElementById(tipo === 'chofer' ? 'choferes' : 'camiones');
      seccion?.scrollIntoView({ block: 'nearest' });
      seccion?.querySelector('input')?.focus({ preventScroll: true });
    });
  }

  function recursoGuardado(tipo: 'chofer' | 'camion') {
    setAlta(null);
    setMensaje(tipo === 'chofer' ? 'Chofer registrado.' : 'Camión registrado.');
    setError('');
    if (tipo === 'chofer') choferes.recargar();
    else camiones.recargar();
  }

  return (
    <Stack gap="6" maxW="6xl" mx="auto">
      <PageHeader title="Logística" subtitle="Registrá la flota, prepará rutas y seguí cada entrega."
        action={<Button {...control} variant="outline" onClick={() => { rutas.recargar(); segmentos.recargar(); }}>Actualizar recorridos</Button>} />
      {mensaje && <Text role="status" color="green.700">{mensaje}</Text>}
      {error && <Text role="alert" color="red.700">{error}</Text>}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
        <Stack {...panel} id="choferes" as="section" gap="4">
          <Heading as="h2" size="md">Choferes</Heading>
          {alta === 'chofer'
            ? <AltaRecurso tipo="chofer" cerrar={() => setAlta(null)} guardado={() => recursoGuardado('chofer')} />
            : <Button {...control} variant="outline" alignSelf="start" onClick={() => abrirAlta('chofer')}>Nuevo chofer</Button>}
          {!choferes.datos ? <EstadoConsulta {...choferes} /> : choferes.datos.length === 0
            ? <Text color="gray.600">Todavía no hay choferes registrados.</Text>
            : choferes.datos.map(c => <Text key={c.id}>{c.nombre} {c.apellido} · DNI {c.dni}</Text>)}
        </Stack>
        <Stack {...panel} id="camiones" as="section" gap="4">
          <Heading as="h2" size="md">Camiones</Heading>
          {alta === 'camion'
            ? <AltaRecurso tipo="camion" cerrar={() => setAlta(null)} guardado={() => recursoGuardado('camion')} />
            : <Button {...control} variant="outline" alignSelf="start" onClick={() => abrirAlta('camion')}>Nuevo camión</Button>}
          {!camiones.datos ? <EstadoConsulta {...camiones} /> : camiones.datos.length === 0
            ? <Text color="gray.600">Todavía no hay camiones registrados.</Text>
            : camiones.datos.map(c => <Text key={c.id}>{c.patente} · {c.marca} {c.modelo} · {c.capacidadCarga} kg</Text>)}
        </Stack>
      </SimpleGrid>
      <Stack {...panel} as="section" gap="4">
        <Heading as="h2" size="md">Preparar ruta</Heading>
        <form onSubmit={crearRuta}>
          <Stack gap="4">
            {pendiente ? <Text>Hay una ruta pendiente con los segmentos {pendiente.segmentoIds.map(id => `#${id}`).join(', ')}.</Text> : (
              <>
                <SimpleGrid columns={{ base: 1, sm: 2 }} gap="3">
                  <Field.Root required>
                    <Field.Label>Chofer</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field {...control} name="choferId" defaultValue="">
                        <option value="">Seleccioná un chofer</option>
                        {choferes.datos?.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label>Camión</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field {...control} name="camionId" defaultValue="">
                        <option value="">Seleccioná un camión</option>
                        {camiones.datos?.map(c => <option key={c.id} value={c.id}>{c.patente} · {c.marca} {c.modelo}</option>)}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>
                </SimpleGrid>
                <HStack gap="2" flexWrap="wrap">
                  {choferes.datos?.length === 0 && <Button {...control} type="button" variant="outline" onClick={() => abrirAlta('chofer')}>Dar de alta un chofer</Button>}
                  {camiones.datos?.length === 0 && <Button {...control} type="button" variant="outline" onClick={() => abrirAlta('camion')}>Dar de alta un camión</Button>}
                </HStack>
                <Box as="fieldset">
                  <Text as="legend" fontWeight="semibold" mb="2">Segmentos asignados disponibles</Text>
                  {!segmentos.datos ? <EstadoConsulta {...segmentos} /> : segmentos.datos.length === 0
                    ? <Text color="gray.600">Las donaciones asignadas con dirección de entrega aparecerán acá.</Text>
                    : <Stack gap="1">
                      {segmentos.datos.map(s => (
                        <HStack as="label" key={s.id} cursor="pointer" gap="3" minH="10" align="center">
                          <input type="checkbox" name="segmento" value={s.id} />
                          <Text fontSize="sm">Segmento #{s.id} · {s.cantidad} {s.unidad?.toLowerCase()} · {s.entidad ?? `Entidad #${s.entidadId}`} · {s.direccion}</Text>
                        </HStack>
                      ))}
                    </Stack>}
                </Box>
              </>
            )}
            <Button {...control} type="submit" colorPalette="teal" alignSelf="start" loading={enCurso === 'crear'}
              disabled={!!enCurso || (!pendiente && !(choferes.datos?.length && camiones.datos?.length && segmentos.datos?.length))}>
              {pendiente ? 'Reintentar preparación' : 'Crear ruta'}
            </Button>
          </Stack>
        </form>
      </Stack>
      <Stack as="section" gap="4">
        <Heading as="h2" size="md">Recorridos</Heading>
        {!rutas.datos ? <EstadoConsulta {...rutas} /> : rutas.datos.length === 0 ? <Text color="gray.600">Todavía no hay rutas preparadas.</Text>
          : rutas.datos.map(({ ruta, segmentos }) => {
            const chofer = choferes.datos?.find(c => c.id === ruta.choferId);
            const camion = camiones.datos?.find(c => c.id === ruta.camionId);
            return (
              <Stack {...panel} as="article" key={ruta.id} gap="4">
                <HStack justify="space-between" flexWrap="wrap">
                  <Stack gap="1">
                    <Heading as="h3" size="md">Ruta {ruta.id.slice(6, 14)}</Heading>
                    <Text color="gray.600" fontSize="sm">{chofer ? `${chofer.nombre} ${chofer.apellido}` : 'Chofer asignado'} · {camion?.patente ?? 'Camión asignado'}</Text>
                  </Stack>
                  {segmentos.some(s => s.estado === 'EN_PLANIFICACION') &&
                    <Button {...control} colorPalette="teal" disabled={!!enCurso} loading={enCurso === ruta.id}
                      onClick={() => void operar(ruta.id, () => logisticaApi.iniciar(ruta.id), 'Recorrido iniciado.')}>Iniciar recorrido</Button>}
                </HStack>
                {ruta.paradas.map(parada => (
                  <Stack key={parada.orden} gap="3" pt="3" borderTopWidth="1px">
                    <Heading as="h4" size="sm">{parada.direccion}</Heading>
                    {segmentos.filter(s => parada.enviosIds.includes(`${ruta.id}-${s.id}`)).map(s => (
                      <Stack key={s.id} gap="3" bg="gray.50" borderRadius="lg" p="4">
                        <Text fontWeight="semibold">Segmento #{s.id} · {s.entidad ?? `Entidad #${s.entidadId}`}</Text>
                        <Progreso segmento={s} />
                        {s.estado === 'NO_RECIBIDA' && <Badge alignSelf="start" colorPalette="orange">Recepción reclamada</Badge>}
                        {s.estado === 'EN_TRASLADO' && s.llegada && <Text fontSize="sm">Esperando confirmación de la entidad.</Text>}
                        {s.estado === 'EN_TRASLADO' && !s.llegada &&
                          <Button {...control} alignSelf="start" variant="outline" disabled={!!enCurso} loading={enCurso === `${ruta.id}-${s.id}`}
                            onClick={() => void operar(`${ruta.id}-${s.id}`, () => logisticaApi.llegada(ruta.id, s.id), 'Llegada registrada.')}>Registrar llegada</Button>}
                      </Stack>
                    ))}
                  </Stack>
                ))}
              </Stack>
            );
          })}
      </Stack>
    </Stack>
  );
}
