import { useState, type FormEvent } from 'react';
import { Button, Field, Heading, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { control } from '@/features/donantes/components/styles';
import { logisticaApi, mensajeLogistica } from '../api/logisticaApi';

const campos = {
  chofer: [
    { name: 'nombre', label: 'Nombre' },
    { name: 'apellido', label: 'Apellido' },
    { name: 'dni', label: 'DNI', pattern: '[0-9]{7,8}' },
  ],
  camion: [
    { name: 'patente', label: 'Patente' },
    { name: 'marca', label: 'Marca' },
    { name: 'modelo', label: 'Modelo' },
    { name: 'capacidadCarga', label: 'Capacidad de carga (kg)', numerico: true },
    { name: 'volumen', label: 'Volumen (m³)', numerico: true },
    { name: 'altura', label: 'Altura (m)', numerico: true },
  ],
};

export function AltaRecurso({ tipo, cerrar, guardado }: { tipo: 'chofer' | 'camion'; cerrar: () => void; guardado: () => void }) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const texto = (campo: string) => String(form.get(campo)).trim();
    setGuardando(true);
    setError('');
    try {
      if (tipo === 'chofer') {
        await logisticaApi.crearChofer({ nombre: texto('nombre'), apellido: texto('apellido'), dni: texto('dni') });
      } else {
        await logisticaApi.crearCamion({
          patente: texto('patente'), marca: texto('marca'), modelo: texto('modelo'),
          capacidadCarga: Number(form.get('capacidadCarga')), volumen: Number(form.get('volumen')), altura: Number(form.get('altura')),
        });
      }
      guardado();
    } catch (err) {
      setError(mensajeLogistica(err, 'No se pudo guardar. Revisá los datos e intentá nuevamente.'));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={enviar}>
      <Stack gap="4">
        <Heading as="h3" size="sm">{tipo === 'chofer' ? 'Nuevo chofer' : 'Nuevo camión'}</Heading>
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="3">
          {campos[tipo].map(campo => (
            <Field.Root key={campo.name} required>
              <Field.Label>{campo.label}</Field.Label>
              <Input {...control} name={campo.name} required type={'numerico' in campo ? 'number' : 'text'}
                min={'numerico' in campo ? '0.001' : undefined} step="any"
                pattern={'pattern' in campo ? campo.pattern : undefined}
                inputMode={'pattern' in campo ? 'numeric' : undefined} />
            </Field.Root>
          ))}
        </SimpleGrid>
        {error && <Text role="alert" color="red.700">{error}</Text>}
        <Stack direction="row" gap="2" flexWrap="wrap">
          <Button {...control} type="submit" colorPalette="teal" loading={guardando}>Guardar {tipo === 'chofer' ? 'chofer' : 'camión'}</Button>
          <Button {...control} type="button" variant="ghost" onClick={cerrar} disabled={guardando}>Cancelar</Button>
        </Stack>
      </Stack>
    </form>
  );
}
