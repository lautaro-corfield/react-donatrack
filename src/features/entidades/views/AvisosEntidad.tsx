import { TituloAviso } from '@/features/avisos/TituloAviso';
import { useLecturaAvisos } from '@/features/avisos/lectura';
import { Button, Stack, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { EstadoConsulta } from '@/features/donantes/components/EstadoConsulta';
import { control, panel } from '@/features/donantes/components/styles';
import { useConsulta } from '@/features/donantes/model/useConsulta';
import { entidadesApi } from '../api/entidadesApi';

export function AvisosEntidad() {
  const consulta = useConsulta(entidadesApi.avisos);
  const lectura = useLecturaAvisos();
  return (
    <Stack gap="6" maxW="6xl" mx="auto">
      <PageHeader title="Avisos" subtitle="Asignaciones, rutas y entregas de tu entidad." action={
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
            <Button {...control} asChild variant="outline" alignSelf="start">
              <Link onClick={() => lectura.marcarLeido(aviso.id)} to={aviso.segmentoId == null ? '/dashboard/donaciones-recibidas' : `/dashboard/donaciones-recibidas?segmento=${aviso.segmentoId}`}>Ver donaciones recibidas</Link>
            </Button>
          </Stack>
        ))}
      </>}
    </Stack>
  );
}
