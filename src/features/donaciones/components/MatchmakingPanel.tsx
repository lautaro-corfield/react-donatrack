import { useState } from 'react';
import { Badge, Button, Card, Stack, Text } from '@chakra-ui/react';
import { matchmakingApi, type ResultadoMatchmaking } from '../api/matchmakingApi';

export function MatchmakingPanel({ segmentoId, onAsignada }: { segmentoId: number; onAsignada: () => void }) {
  const [resultado, setResultado] = useState<ResultadoMatchmaking | null>(null);
  const [cargando, setCargando] = useState(false);
  const [asignandoId, setAsignandoId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState('');

  async function buscar() {
    setCargando(true); setMensaje('');
    try { setResultado(await matchmakingApi.ranking(segmentoId)); }
    catch { setMensaje('No se pudo calcular el ranking. Confirmá que el segmento siga en depósito.'); }
    finally { setCargando(false); }
  }

  async function asignar(id: number) {
    setAsignandoId(id); setMensaje('');
    try {
      await matchmakingApi.asignar(segmentoId, id);
      setMensaje('Asignación guardada. La donación ya tiene una entidad de destino.');
      onAsignada();
    } catch (error) {
      const data = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: unknown } }).response?.data : null;
      setMensaje(typeof data === 'string' ? data : 'No se pudo asignar; la necesidad o el estado pudieron cambiar.');
    } finally { setAsignandoId(null); }
  }

  const candidatos = resultado?.huboCoincidencias
    ? resultado.coincidencias
    : [...new Map([...(resultado?.rankingCompatibilidad ?? []), ...(resultado?.rankingSubAtendidos ?? [])]
        .map(entidad => [entidad.id, entidad])).values()];

  return (
    <Card.Root mt="3" borderWidth="1px" borderColor="teal.100" bg="teal.50/40" borderRadius="xl">
      <Card.Body>
        <Stack gap="3">
          {!resultado && <Button size="sm" variant="outline" colorPalette="teal" alignSelf="start" onClick={() => void buscar()} loading={cargando}>Ejecutar matchmaking</Button>}
          {resultado && <>
            <Stack direction="row" align="center" wrap="wrap">
              <Text fontWeight="semibold">Resultado para {resultado.subCategoria}</Text>
              <Badge colorPalette={resultado.huboCoincidencias ? 'green' : 'orange'}>
                {resultado.huboCoincidencias ? 'Coincidencias' : 'Sin intersección'}
              </Badge>
            </Stack>
            {!resultado.huboCoincidencias && <Text fontSize="sm" color="gray.700">No hubo coincidencia entre algoritmos. Podés elegir una entidad rankeada que conserve una necesidad compatible.</Text>}
            {candidatos.length === 0 ? <Text fontSize="sm">No hay entidades con una necesidad compatible.</Text> : candidatos.map(entidad => (
              <Stack key={entidad.id} direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} borderTopWidth="1px" borderColor="gray.200" pt="2">
                <Text>{entidad.razonSocial} · {entidad.cantNecesidadesActivas} necesidades activas</Text>
                <Button size="sm" colorPalette="teal" onClick={() => void asignar(entidad.id)} loading={asignandoId === entidad.id}>Asignar</Button>
              </Stack>
            ))}
            {resultado.huboCoincidencias && resultado.coincidencias.length === 0 && <Text>No hay entidades compatibles actualmente.</Text>}
          </>}
          {mensaje && <Text role="status" fontSize="sm" color={mensaje.startsWith('Asignación') ? 'green.700' : 'red.700'}>{mensaje}</Text>}
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}
