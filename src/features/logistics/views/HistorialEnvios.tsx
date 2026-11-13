import { Badge, Box, Button, Heading, HStack, Separator, Stack, Text } from '@chakra-ui/react';
import { EstadoConsulta } from '@/features/donantes/components/EstadoConsulta';
import { control, panel } from '@/features/donantes/components/styles';
import { useConsulta } from '@/features/donantes/model/useConsulta';
import { PageHeader } from '@/shared/components/PageHeader';
import { logisticaApi } from '../api/logisticaApi';
import type { SegmentoLogistico } from '../model/types';

function segmentoDeParada(rutaId: string, ids: string[], segmentos: SegmentoLogistico[]) {
  return segmentos.filter(segmento => ids.includes(`${rutaId}-${segmento.id}`));
}

export function HistorialEnvios() {
  const historial = useConsulta(logisticaApi.historialRutas);
  const choferes = useConsulta(logisticaApi.choferes);
  const camiones = useConsulta(logisticaApi.camiones);

  return (
    <Stack gap="6" maxW="6xl" mx="auto">
      <PageHeader title="Historial de envíos" subtitle="Rutas con todas sus entregas confirmadas. Desplegá una ruta para consultar el detalle."
        action={<Button {...control} variant="outline" onClick={() => historial.recargar()}>Actualizar historial</Button>} />
      {!historial.datos ? <EstadoConsulta {...historial} /> : historial.datos.length === 0
        ? <Box {...panel} role="status"><Text color="gray.600">Todavía no hay rutas con todas sus entregas confirmadas.</Text></Box>
        : <Stack as="ul" listStyle="none" gap="3">
          {historial.datos.map(({ ruta, segmentos }) => {
            const chofer = choferes.datos?.find(c => c.id === ruta.choferId);
            const camion = camiones.datos?.find(c => c.id === ruta.camionId);
            return (
              <Box as="li" key={ruta.id} {...panel} p="0" overflow="hidden">
                <Box as="details">
                  <Box as="summary" cursor="pointer" px="5" py="4" _hover={{ bg: 'gray.50' }} _focusVisible={{ outline: '2px solid', outlineColor: 'teal.600', outlineOffset: '-2px' }}>
                    <HStack justify="space-between" gap="4" flexWrap="wrap">
                      <Stack gap="1">
                        <Heading as="h2" size="sm">Ruta {ruta.id}</Heading>
                        <Text fontSize="sm" color="gray.600">{chofer ? `${chofer.nombre} ${chofer.apellido}` : `Chofer #${ruta.choferId}`} · {camion?.patente ?? `Camión #${ruta.camionId}`}</Text>
                      </Stack>
                      <Badge colorPalette="green">{segmentos.length} {segmentos.length === 1 ? 'entrega confirmada' : 'entregas confirmadas'}</Badge>
                    </HStack>
                  </Box>
                  <Stack px="5" pb="5" gap="4">
                    <Separator />
                    {ruta.paradas.map(parada => (
                      <Stack key={parada.orden} gap="2">
                        <Heading as="h3" size="sm">Parada {parada.orden} · {parada.direccion}</Heading>
                        {segmentoDeParada(ruta.id, parada.enviosIds, segmentos).map(segmento => (
                          <HStack key={segmento.id} justify="space-between" gap="3" flexWrap="wrap" borderWidth="1px" borderColor="gray.200" borderRadius="md" p="3">
                            <Text fontSize="sm">Segmento #{segmento.id} · {segmento.entidad ?? `Entidad #${segmento.entidadId}`} · {segmento.cantidad} {segmento.unidad?.toLowerCase()}</Text>
                            <Badge colorPalette="green">Entrega confirmada</Badge>
                          </HStack>
                        ))}
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Box>
            );
          })}
        </Stack>}
    </Stack>
  );
}
