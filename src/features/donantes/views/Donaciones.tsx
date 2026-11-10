import { Badge, Box, Heading, NativeSelect, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { donantesApi } from '../api/donantesApi';
import { EstadoConsulta } from '../components/EstadoConsulta';
import { control, panel } from '../components/styles';
import { useConsulta } from '../model/useConsulta';

const mostrar = (valor: string) => valor.replaceAll('_', ' ').toLocaleLowerCase('es-AR');

function Filtro({ etiqueta, valores, valor, cambiar }: {
  etiqueta: string; valores: (string | null)[]; valor: string; cambiar: (valor: string) => void;
}) {
  return (
    <NativeSelect.Root>
      <NativeSelect.Field {...control} aria-label={etiqueta} value={valor} onChange={e => cambiar(e.target.value)}>
        <option value="">{etiqueta}</option>
        {[...new Set(valores)].filter(v => v !== null).sort().map(v => <option key={v} value={v}>{mostrar(v)}</option>)}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}

export function MisDonaciones() {
  const consulta = useConsulta(donantesApi.donaciones);
  const { hash } = useLocation();
  useEffect(() => {
    if (consulta.datos && /^#donacion-\d+$/.test(hash)) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
    }
  }, [consulta.datos, hash]);
  const [estado, setEstado] = useState('');
  const [categoria, setCategoria] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const segmentos = consulta.datos?.flatMap(d => d.segmentos) ?? [];
  const resultados = consulta.datos?.flatMap(d => {
    const seleccion = d.segmentos.filter(s => (!estado || s.estado === estado)
      && (!categoria || s.categoria === categoria) && (!subcategoria || s.subcategoria === subcategoria));
    return seleccion.length ? [{ ...d, segmentos: seleccion }] : [];
  });

  return (
    <Stack gap="6" maxW="6xl" mx="auto">
      <PageHeader title="Mis donaciones" subtitle="Consultá el estado y el recorrido de tus aportes." />
      {!resultados ? <EstadoConsulta {...consulta} /> : <>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="3">
          <Filtro etiqueta="Todos los estados" valores={segmentos.map(s => s.estado)} valor={estado} cambiar={setEstado} />
          <Filtro etiqueta="Todas las categorías" valores={segmentos.map(s => s.categoria)} valor={categoria}
            cambiar={valor => { setCategoria(valor); setSubcategoria(''); }} />
          <Filtro etiqueta="Todas las subcategorías" valores={segmentos.filter(s => !categoria || s.categoria === categoria).map(s => s.subcategoria)}
            valor={subcategoria} cambiar={setSubcategoria} />
        </SimpleGrid>
        {resultados.length === 0 && <Text>No hay donaciones que coincidan con la búsqueda.</Text>}
        {resultados.map(d => (
          <Stack {...panel} key={d.id} id={`donacion-${d.id}`} gap="4">
            <Heading as="h2" size="md">{d.descripcion || `Donación ${d.id}`}</Heading>
            {d.fechaIngreso && <Text>Ingreso: {new Date(d.fechaIngreso).toLocaleDateString('es-AR')}</Text>}
            {d.segmentos.map(s => (
              <Box key={s.id} borderTopWidth="1px" pt="3">
                <Heading as="h3" size="sm">{s.subcategoria ?? 'Bienes donados'}</Heading>
                <Badge colorPalette="teal">{mostrar(s.estado)}</Badge>
                <Stack as="ol" mt="2" gap="2" listStyle="none">
                  {s.eventos.map((evento, i) => (
                    <Box as="li" key={i}>
                      <Text fontWeight="medium">{mostrar(evento.estado)} · {new Date(evento.fecha).toLocaleString('es-AR')}</Text>
                      {evento.descripcion && <Text>{evento.descripcion}</Text>}
                    </Box>
                  ))}
                </Stack>
                {s.comprobante && (
                  <Text mt="3">Entregada a {s.comprobante.nombreEntidad} el {new Date(s.comprobante.fechaEntrega).toLocaleString('es-AR')}.
                    {' '}{s.comprobante.detallesLogistica}</Text>
                )}
              </Box>
            ))}
          </Stack>
        ))}
      </>}
    </Stack>
  );
}
