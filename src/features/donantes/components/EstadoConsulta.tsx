import { Button, HStack, Spinner, Text } from '@chakra-ui/react';
import { control } from './styles';

export function EstadoConsulta({ error, recargar }: { error?: string; recargar: () => void }) {
  if (error) return (
    <HStack wrap="wrap">
      <Text role="alert">{error}</Text>
      <Button {...control} onClick={recargar}>Reintentar</Button>
    </HStack>
  );
  return <HStack role="status"><Spinner /><Text>Cargando…</Text></HStack>;
}
