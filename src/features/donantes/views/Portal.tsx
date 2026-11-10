import { Box, Button, Heading, Progress, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { PageHeader } from '@/shared/components/PageHeader';
import { donantesApi } from '../api/donantesApi';
import { EstadoConsulta } from '../components/EstadoConsulta';
import { control, panel } from '../components/styles';
import type { ResumenDonante } from '../model/types';
import { useConsulta } from '../model/useConsulta';

function Actividad({ resumen }: { resumen: ResumenDonante }) {
  const { metricas } = resumen;
  const meses = [...metricas.comparacionesMensuales].sort((a, b) => a.anio - b.anio || a.mes - b.mes);
  const maximo = Math.max(1, ...meses.map(mes => mes.totalDonaciones));
  const formatoMes = new Intl.DateTimeFormat('es-AR', { month: 'short', year: 'numeric' });

  return (
    <Stack gap="4">
      <SimpleGrid columns={{ base: 2, lg: 4 }} gap="3">
        {[
          ['Donaciones del mes', metricas.donacionesMesActual],
          ['Entregas exitosas', metricas.totalDonacionesExitosas],
          ['Entidades ayudadas', metricas.entidadesAyudadasCount],
          ['Puesto en el ranking', resumen.ranking],
        ].map(([etiqueta, valor]) => (
          <Box {...panel} key={etiqueta}>
            <Text fontSize="sm">{etiqueta}</Text>
            <Text fontSize="2xl" fontWeight="bold">{valor}</Text>
          </Box>
        ))}
      </SimpleGrid>
      <Stack {...panel} gap="3">
        <Heading as="h2" size="md">Evolución mensual</Heading>
        {meses.length === 0 && <Text>Todavía no hay actividad para comparar.</Text>}
        {meses.map(mes => {
          const etiqueta = formatoMes.format(new Date(mes.anio, mes.mes - 1, 1));
          return (
            <Stack key={etiqueta} gap="1">
              <Text>{etiqueta} · {mes.totalDonaciones}</Text>
              <Progress.Root colorPalette="teal" value={mes.totalDonaciones} max={maximo} aria-label={etiqueta}>
                <Progress.Track><Progress.Range /></Progress.Track>
              </Progress.Root>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}

export function PortalDonante() {
  const resumen = useConsulta(donantesApi.resumen);
  if (!resumen.datos) return <EstadoConsulta {...resumen} />;

  return (
    <Stack gap="6" maxW="6xl" mx="auto">
      <PageHeader title="Mi actividad" subtitle={resumen.datos.nombre} action={
        <Button {...control} variant="outline" onClick={resumen.recargar}>Actualizar</Button>
      } />
      <Actividad resumen={resumen.datos} />
    </Stack>
  );
}
