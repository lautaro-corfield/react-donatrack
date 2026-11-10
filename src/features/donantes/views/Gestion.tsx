import { Button, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { panel } from '../components/styles';

export function GestionDonantes() {
  const navigate = useNavigate();

  return (
    <Stack gap="6" maxW="5xl" mx="auto" w="full">
      <PageHeader title="Donantes" subtitle="Administrá los registros y accesos de personas y organizaciones donantes." />
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4" maxW="3xl">
        <Stack {...panel} gap="3" align="start">
          <Heading as="h2" size="md">Registrar un donante</Heading>
          <Text color="gray.600">Cargá los datos de una persona o una organización.</Text>
          <Button minH="12" minW="12" borderRadius="xl" colorPalette="teal" onClick={() => navigate('/dashboard/donantes/nuevo')}>
            Registrar nuevo donante
          </Button>
        </Stack>
        <Stack {...panel} gap="3" align="start">
          <Heading as="h2" size="md">Importar varios donantes</Heading>
          <Text color="gray.600">Registrá o actualizá donantes en lote desde un archivo CSV.</Text>
          <Button minH="12" minW="12" borderRadius="xl" variant="outline" onClick={() => navigate('/dashboard/donantes/importar')}>
            Importar desde CSV
          </Button>
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}
