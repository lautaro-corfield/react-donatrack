import { useEffect, useState } from 'react';
import { Badge, Box, Button, Field, Heading, HStack, Image, Input, NativeSelect, Stack, Text, Textarea } from '@chakra-ui/react';
import { isAxiosError } from 'axios';
import { PageHeader } from '@/shared/components/PageHeader';
import { EstadoConsulta } from '@/features/donantes/components/EstadoConsulta';
import { control, panel } from '@/features/donantes/components/styles';
import { useConsulta } from '@/features/donantes/model/useConsulta';
import { entidadesApi } from '../api/entidadesApi';
import type { DonacionRecibida, SegmentoRecibido } from '../model/types';

const MAX_FOTOS = 4;
const MAX_BYTES = 2 * 1024 * 1024;
const TIPOS = ['image/jpeg', 'image/png', 'image/webp'];
const mostrar = (valor: string) => valor.replaceAll('_', ' ').toLocaleLowerCase('es-AR');
const colorEstado: Record<string, string> = {
  ENTREGADA: 'green', EN_TRASLADO: 'blue', NO_RECIBIDA: 'orange', ENTREGA_FALLIDA: 'red',
};

function mensajeError(e: unknown) {
  if (isAxiosError(e) && typeof e.response?.data === 'object' && e.response?.data && 'message' in e.response.data) {
    return String((e.response.data as { message: unknown }).message);
  }
  if (isAxiosError(e) && typeof e.response?.data === 'string' && e.response.data) return e.response.data;
  return 'No pudimos completar la operación. Intentá de nuevo.';
}

function Foto({ id }: { id: number }) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    let actual: string | undefined;
    entidadesApi.foto(id).then(blob => { actual = URL.createObjectURL(blob); setUrl(actual); }, () => undefined);
    return () => { if (actual) URL.revokeObjectURL(actual); };
  }, [id]);
  return url ? <Image src={url} alt="Foto de la recepción" boxSize="24" objectFit="cover" borderRadius="md" /> : null;
}

function AccionesEnCamino({ donacion, segmento, listo }: { donacion: DonacionRecibida; segmento: SegmentoRecibido; listo: () => void }) {
  const [modo, setModo] = useState<'nada' | 'confirmar' | 'reclamar'>('nada');
  const [fotos, setFotos] = useState<File[]>([]);
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  function elegirFotos(lista: FileList | null) {
    const archivos = Array.from(lista ?? []);
    if (archivos.length > MAX_FOTOS) return setError(`Podés cargar hasta ${MAX_FOTOS} fotos.`);
    if (archivos.some(f => !TIPOS.includes(f.type))) return setError('Las fotos deben ser JPG, PNG o WEBP.');
    if (archivos.some(f => f.size > MAX_BYTES)) return setError('Cada foto puede pesar hasta 2 MB.');
    setError(''); setFotos(archivos);
  }

  async function enviar() {
    setEnviando(true); setError('');
    try {
      if (modo === 'confirmar') await entidadesApi.confirmarRecepcion(donacion.id, segmento.id, fotos);
      else await entidadesApi.informarNoRecibida(donacion.id, segmento.id, motivo.trim());
      listo();
    } catch (e) { setError(mensajeError(e)); }
    finally { setEnviando(false); }
  }

  if (modo === 'nada') return (
    <HStack wrap="wrap" mt="3">
      <Button {...control} colorPalette="teal" onClick={() => setModo('confirmar')}>Confirmar recepción</Button>
      <Button {...control} variant="outline" colorPalette="orange" onClick={() => setModo('reclamar')}>No la recibí</Button>
    </HStack>
  );

  return (
    <Stack mt="3" gap="3" borderWidth="1px" borderRadius="lg" p="4" bg="gray.50">
      {modo === 'confirmar' ? (
        <Field.Root>
          <Field.Label>Fotos de lo recibido (opcional, hasta {MAX_FOTOS}, 2 MB cada una)</Field.Label>
          <Input type="file" accept={TIPOS.join(',')} multiple pt="2" onChange={e => elegirFotos(e.target.files)} />
          {fotos.length > 0 && <Text fontSize="sm">{fotos.length} {fotos.length === 1 ? 'foto seleccionada' : 'fotos seleccionadas'}</Text>}
        </Field.Root>
      ) : (
        <Field.Root required>
          <Field.Label>¿Qué pasó con la entrega?</Field.Label>
          <Textarea maxLength={500} value={motivo} onChange={e => setMotivo(e.target.value)}
            placeholder="Ej. El camión no llegó en el horario acordado." />
          <Field.HelperText>Administración va a revisar el caso.</Field.HelperText>
        </Field.Root>
      )}
      {error && <Text role="alert" color="red.600">{error}</Text>}
      <HStack wrap="wrap">
        <Button {...control} colorPalette={modo === 'confirmar' ? 'teal' : 'orange'} loading={enviando}
          disabled={modo === 'reclamar' && !motivo.trim()} onClick={enviar}>
          {modo === 'confirmar' ? 'Confirmar recepción' : 'Informar a administración'}
        </Button>
        <Button {...control} variant="ghost" onClick={() => { setModo('nada'); setError(''); setFotos([]); }}>Cancelar</Button>
      </HStack>
    </Stack>
  );
}

export function DonacionesRecibidas() {
  const consulta = useConsulta(entidadesApi.misDonaciones);
  const [estado, setEstado] = useState('');
  const estados = [...new Set(consulta.datos?.flatMap(d => d.segmentos.map(s => s.estado)) ?? [])].sort();
  const resultados = consulta.datos?.flatMap(d => {
    const segmentos = d.segmentos.filter(s => !estado || s.estado === estado);
    return segmentos.length ? [{ ...d, segmentos }] : [];
  });

  return (
    <Stack gap="6" maxW="6xl" mx="auto">
      <PageHeader title="Donaciones recibidas" subtitle="Seguí las donaciones asignadas a tu entidad y confirmá las entregas."
        action={<Button {...control} variant="outline" onClick={consulta.recargar}>Actualizar</Button>} />
      {!resultados ? <EstadoConsulta {...consulta} /> : <>
        <Box maxW="xs">
          <NativeSelect.Root>
            <NativeSelect.Field {...control} aria-label="Filtrar por estado" value={estado} onChange={e => setEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              {estados.map(e => <option key={e} value={e}>{mostrar(e)}</option>)}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Box>
        {resultados.length === 0 && <Text>{consulta.datos?.length ? 'No hay donaciones en ese estado.' : 'Todavía no se asignaron donaciones a tu entidad.'}</Text>}
        {resultados.map(d => (
          <Stack {...panel} key={d.id} gap="4">
            <Stack gap="1">
              <Heading as="h2" size="md">{d.descripcion || `Donación ${d.id}`}</Heading>
              <Text fontSize="sm" color="gray.600">
                {d.donante ? `Donada por ${d.donante}` : 'Donante anónimo'}
                {d.fechaIngreso && ` · ingresó el ${new Date(d.fechaIngreso).toLocaleDateString('es-AR')}`}
              </Text>
            </Stack>
            {d.segmentos.map(s => (
              <Box key={s.id} borderTopWidth="1px" pt="3">
                <HStack justify="space-between" wrap="wrap">
                  <Heading as="h3" size="sm">{s.subcategoria ?? 'Bienes donados'} · {s.cantidad}{s.unidad ? ` ${s.unidad.toLocaleLowerCase('es-AR')}` : ''}</Heading>
                  <Badge colorPalette={colorEstado[s.estado] ?? 'teal'}>{mostrar(s.estado)}</Badge>
                </HStack>
                <Stack as="ol" mt="2" gap="1" listStyle="none">
                  {s.eventos.map((e, i) => (
                    <Box as="li" key={i} fontSize="sm">
                      <Text as="span" fontWeight="medium">{mostrar(e.estado)}</Text> · {new Date(e.fecha).toLocaleString('es-AR')}
                      {e.descripcion && <Text color="gray.600">{e.descripcion}</Text>}
                    </Box>
                  ))}
                </Stack>
                {s.comprobante && (
                  <Text mt="3" fontSize="sm">Recibida el {new Date(s.comprobante.fechaEntrega).toLocaleString('es-AR')}. Comprobante {s.comprobante.id.slice(0, 8)}.</Text>
                )}
                {s.fotos.length > 0 && <HStack mt="2" wrap="wrap">{s.fotos.map(f => <Foto key={f} id={f} />)}</HStack>}
                {s.estado === 'NO_RECIBIDA' && <Text mt="2" fontSize="sm" color="orange.700">Administración está revisando esta entrega.</Text>}
                {s.estado === 'EN_TRASLADO' && <AccionesEnCamino donacion={d} segmento={s} listo={consulta.recargar} />}
              </Box>
            ))}
          </Stack>
        ))}
      </>}
    </Stack>
  );
}
