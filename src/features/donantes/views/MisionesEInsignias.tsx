import { Badge, Box, Button, Heading, HStack, Progress, Stack, Switch, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { toaster } from '@/shared/components/toaster.instance';
import { donantesApi, errorDonantes } from '../api/donantesApi';
import { EstadoConsulta } from '../components/EstadoConsulta';
import { control, panel } from '../components/styles';
import type { ResumenDonante } from '../model/types';
import { useConsulta } from '../model/useConsulta';

function Incentivos({ perfil }: { perfil: NonNullable<ResumenDonante['perfil']> }) {
  const catalogo = useConsulta(donantesApi.misiones);
  const [visible, setVisible] = useState(perfil.visibilidadInsignia);
  const [guardando, setGuardando] = useState(false);
  const misionesDelNivel = catalogo.datos?.filter(mision => mision.nivel === perfil.categoriaDonante) ?? [];
  const inicioDelNivel = catalogo.datos?.findIndex(mision => mision.nivel === perfil.categoriaDonante) ?? -1;
  const insigniasAnteriores = inicioDelNivel > 0 ? catalogo.datos?.slice(0, inicioDelNivel) : undefined;

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
    <Stack gap="4">
      <Stack {...panel} gap="3">
        <HStack wrap="wrap">
          <Heading as="h2" size="md">Mi nivel</Heading>
          <Badge colorPalette="teal" textTransform="capitalize">{perfil.categoriaDonante.toLowerCase()}</Badge>
        </HStack>
        <Switch.Root {...control} checked={visible} disabled={guardando} onCheckedChange={event => cambiarVisibilidad(event.checked)}>
          <Switch.HiddenInput /><Switch.Control /><Switch.Label>Mostrar insignias en mi perfil</Switch.Label>
        </Switch.Root>
      </Stack>

      <Stack {...panel} gap="4">
        <Heading as="h2" size="md">Misiones de mi nivel</Heading>
        {!catalogo.datos && <EstadoConsulta {...catalogo} />}
        {catalogo.datos && misionesDelNivel.length === 0 && <Text>Todavía no hay misiones para tu nivel.</Text>}
        {misionesDelNivel.map(mision => {
          const actual = mision.orden === perfil.misionActualId;
          const obtenida = perfil.misionActualId === null || mision.orden < perfil.misionActualId;
          const avance = Math.max(0, perfil.progreso ?? 0);
          const progreso = mision.progresoEnUnidades
            ? mision.objetivo > 0 ? Math.min(100, 100 * avance / mision.objetivo) : 0
            : Math.min(100, avance);
          const faltan = Math.max(0, mision.objetivo - Math.round(mision.objetivo * progreso / 100));
          return (
            <Stack key={mision.orden} borderTopWidth="1px" pt="3" gap="2">
              <HStack wrap="wrap">
                <Heading as="h3" size="sm">{mision.titulo}</Heading>
                <Badge colorPalette={obtenida || actual ? 'teal' : 'gray'}>
                  {obtenida ? 'Insignia obtenida' : actual ? 'Misión actual' : 'Pendiente'}
                </Badge>
              </HStack>
              <Text>{mision.descripcion}</Text>
              {actual && (
                <Stack gap="1">
                  <Text>{Math.round(progreso)}% completado · faltan {faltan} de {mision.objetivo}</Text>
                  <Progress.Root value={progreso} colorPalette="teal" aria-label={`Progreso de ${mision.titulo}`}>
                    <Progress.Track><Progress.Range /></Progress.Track>
                  </Progress.Root>
                </Stack>
              )}
            </Stack>
          );
        })}
      </Stack>

      {insigniasAnteriores && (
        <Stack {...panel} gap="3">
          <Heading as="h2" size="md">Insignias de niveles anteriores</Heading>
          <HStack wrap="wrap">
            {insigniasAnteriores.map(mision => (
              <Badge key={`${mision.nivel}-${mision.orden}`} colorPalette="teal" whiteSpace="normal">
                {mision.titulo}
              </Badge>
            ))}
          </HStack>
        </Stack>
      )}
    </Stack>
  );
}

export function MisionesEInsignias() {
  const resumen = useConsulta(donantesApi.resumen);

  return (
    <Stack gap="6" maxW="6xl" mx="auto">
      <PageHeader title="Misiones e Insignias" subtitle="Consultá tu nivel, tu progreso y las insignias que obtuviste." action={
        <Button {...control} variant="outline" onClick={resumen.recargar}>Actualizar</Button>
      } />
      {!resumen.datos ? <EstadoConsulta {...resumen} /> : resumen.datos.perfil ? (
        <Incentivos perfil={resumen.datos.perfil} />
      ) : (
        <Box {...panel}>
          <Text>{resumen.datos.humana
            ? 'Tu perfil de incentivos todavía no está disponible.'
            : 'Las misiones e insignias están disponibles para donantes que son personas humanas.'}</Text>
        </Box>
      )}
    </Stack>
  );
}
