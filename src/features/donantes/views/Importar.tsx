import { Button, Field, Heading, Input, Stack, Text } from '@chakra-ui/react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { donantesApi, errorDonantes } from '../api/donantesApi';
import { control, panel } from '../components/styles';

export function DonantesImportarView() {
  const navigate = useNavigate();
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState<{ texto: string; error: boolean }>();

  async function importar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = evento.currentTarget;
    const archivo = new FormData(form).get('archivo');
    if (!(archivo instanceof File) || !archivo.size) return;

    setImportando(true);
    setResultado(undefined);
    try {
      const respuesta = await donantesApi.importar(archivo);
      setResultado({ texto: respuesta.message, error: !respuesta.success });
      if (respuesta.success) form.reset();
    } catch (error) {
      setResultado({ texto: errorDonantes(error), error: true });
    } finally {
      setImportando(false);
    }
  }

  return (
    <Stack gap="6" maxW="5xl" mx="auto" w="full">
      <PageHeader
        title="Importar donantes desde CSV"
        subtitle="Cargá un archivo para registrar o actualizar donantes en lote."
        action={<Button minH="12" minW="12" borderRadius="xl" variant="outline" onClick={() => navigate('/dashboard/donantes')}>Volver a donantes</Button>}
      />
      <Stack {...panel} gap="4">
        <Heading as="h2" size="lg">Archivo de importación</Heading>
        <Text color="gray.600">Columnas en orden: tipoPersona, tipoDoc, documento, nombre, email y telefono. Usá HUMANA o JURIDICA para el tipo.</Text>
        <form onSubmit={importar}>
          <Stack gap="4">
            <Field.Root>
              <Field.Label>Archivo CSV</Field.Label>
              <Input {...control} borderRadius="xl" name="archivo" type="file" accept=".csv,text/csv" required />
            </Field.Root>
            <Button {...control} borderRadius="xl" type="submit" loading={importando} colorPalette="teal" alignSelf="start">Importar CSV</Button>
          </Stack>
        </form>
        {resultado && <Text role={resultado.error ? 'alert' : 'status'}>{resultado.texto}</Text>}
      </Stack>
    </Stack>
  );
}
