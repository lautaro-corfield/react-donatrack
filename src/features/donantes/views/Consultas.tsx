import { TituloAviso } from '@/features/avisos/TituloAviso';
import { useLecturaAvisos } from '@/features/avisos/lectura';
import { Button, Stack, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { donantesApi } from '../api/donantesApi';
import { EstadoConsulta } from '../components/EstadoConsulta';
import { control, panel } from '../components/styles';
import { useConsulta } from '../model/useConsulta';

export function AvisosDonante() {
  const consulta = useConsulta(donantesApi.avisos);
  const lectura = useLecturaAvisos();
  return (
    <Stack gap="6" maxW="6xl" mx="auto">
      <PageHeader title="Mis avisos" subtitle="Novedades sobre tus donaciones y tu participación." action={
        <Button {...control} variant="outline" onClick={consulta.recargar}>Actualizar</Button>
      } />
      {!consulta.datos ? <EstadoConsulta {...consulta} /> : <>
        {consulta.datos.length === 0 && <Text>Todavía no recibiste avisos.</Text>}
        {consulta.datos.map(aviso => (
          <Stack {...panel} key={aviso.id} gap="2">
            <TituloAviso asunto={aviso.asunto} sinLeer={lectura.sinLeer(aviso.id)}
              marcarLeido={() => lectura.marcarLeido(aviso.id)} />
            {aviso.fecha && <Text fontSize="sm">{new Date(aviso.fecha).toLocaleString('es-AR')}</Text>}
            <Text>{aviso.mensaje}</Text>
            {(aviso.donacionId != null || aviso.mensaje?.includes('/dashboard/mis-donaciones')) && (
              <Button {...control} asChild variant="outline" alignSelf="start">
                <Link onClick={() => lectura.marcarLeido(aviso.id)} to={`/dashboard/mis-donaciones${aviso.donacionId != null ? `#donacion-${aviso.donacionId}` : aviso.mensaje?.match(/#donacion-\d+/)?.[0] ?? ''}`}>Ver trazabilidad</Link>
              </Button>
            )}
          </Stack>
        ))}
      </>}
    </Stack>
  );
}
