import { Badge, Box, Button, Heading, Progress, SimpleGrid, Stack, Switch, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { toaster } from '@/shared/components/toaster.instance';
import { donantesApi, errorDonantes } from '../api/donantesApi';
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

function Incentivos({ perfil }: { perfil: NonNullable<ResumenDonante['perfil']> }) {
  const catalogo = useConsulta(donantesApi.misiones);
  const [visible, setVisible] = useState(perfil.visibilidadInsignia);
  const [guardando, setGuardando] = useState(false);
  const indiceActual = catalogo.datos?.findIndex(m => m.nivel === perfil.categoriaDonante && m.orden === perfil.misionActualId) ?? -1;

  async function cambiarVisibilidad(valor: boolean) {
    setGuardando(true);
    try {
      await donantesApi.visibilidad(valor);
      setVisible(valor);
      toaster.create({ type: 'success', title: 'Visibilidad actualizada' });
    } catch (error) {
      toaster.create({ type: 'error', title: errorDonantes(error) });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Stack {...panel} gap="4">
      <Heading as="h2" size="md">Misiones e insignias</Heading>
      <Text>Categoría actual <Badge colorPalette="teal">{perfil.categoriaDonante}</Badge></Text>
      <Switch.Root {...control} checked={visible} disabled={guardando} onCheckedChange={e => cambiarVisibilidad(e.checked)}>
        <Switch.HiddenInput /><Switch.Control /><Switch.Label>Mostrar insignias en mi perfil</Switch.Label>
      </Switch.Root>
      {!catalogo.datos && <EstadoConsulta {...catalogo} />}
      {catalogo.datos?.map((mision, indice) => {
        const actual = indice === indiceActual;
        const avance = Math.max(0, perfil.progreso ?? 0);
        const progreso = Math.min(100, mision.progresoEnUnidades ? 100 * avance / mision.objetivo : avance);
        const faltan = Math.max(0, mision.objetivo - Math.round(mision.objetivo * progreso / 100));
        const obtenida = perfil.misionActualId === null || (indiceActual >= 0 && indice < indiceActual);
        return (
          <Box key={`${mision.nivel}-${mision.orden}`} borderTopWidth="1px" pt="3">
            <Heading as="h3" size="sm">{mision.titulo}</Heading>
            <Text>{mision.descripcion}</Text>
            <Badge colorPalette={obtenida || actual ? 'teal' : 'gray'}>
              {obtenida ? 'Insignia obtenida' : actual ? 'Misión actual' : 'Pendiente'}
            </Badge>
            {actual && (
              <Stack gap="1" mt="2">
                <Text>{Math.round(progreso)}% completado · faltan {faltan} de {mision.objetivo}</Text>
                <Progress.Root value={progreso} colorPalette="teal" aria-label="Progreso de la misión actual">
                  <Progress.Track><Progress.Range /></Progress.Track>
                </Progress.Root>
              </Stack>
            )}
          </Box>
        );
      })}
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
      {resumen.datos.humana && resumen.datos.perfil && <Incentivos perfil={resumen.datos.perfil} />}
    </Stack>
  );
}
