import { Button, Heading, Stack } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { toaster } from '@/shared/components/toaster.instance';
import { donantesApi, errorDonantes } from '../api/donantesApi';
import { Form } from '../components/Form';
import { panel } from '../components/styles';
import type { AltaDonante } from '../model/types';

export function DonantesCreateView() {
  const navigate = useNavigate();
  const [guardando, setGuardando] = useState(false);

  async function guardar(tipo: 'humano' | 'juridico', datos: AltaDonante) {
    setGuardando(true);
    try {
      await donantesApi.alta(tipo, datos);
      toaster.create({ type: 'success', title: 'Donante registrado', description: 'Ya puede ingresar con Google usando su correo registrado.' });
      return true;
    } catch (error) {
      toaster.create({ type: 'error', title: errorDonantes(error) });
      return false;
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Stack gap="6" maxW="5xl" mx="auto" w="full">
      <PageHeader
        title="Registrar nuevo donante"
        subtitle="Completá los datos en tres pasos. Podés volver a los pasos anteriores para corregir la información."
        action={<Button minH="12" minW="12" borderRadius="xl" variant="outline" onClick={() => navigate('/dashboard/donantes')}>Volver a donantes</Button>}
      />
      <Stack {...panel} gap="5">
        <Heading as="h2" size="lg">Datos del donante</Heading>
        <Form guardando={guardando} onSubmit={guardar} />
      </Stack>
    </Stack>
  );
}
