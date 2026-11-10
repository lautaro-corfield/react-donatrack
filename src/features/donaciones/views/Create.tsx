import { useState } from 'react';
import { Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { donantesApi } from '@/features/donantes/api/donantesApi';
import { errorDonacion } from '../api/donacionesApi';
import { DonacionForm } from '../components/Form';
import { useDonacionesStore } from '../model/donacionesStore';
import type { CreateDonacionDTO } from '../model/types';

function buscarDonantes(valor: string) {
  return valor.includes('@') ? donantesApi.buscarPorCorreo(valor) : donantesApi.buscarPorDni(valor);
}
export const DonacionesCreateView = () => {
  const navigate = useNavigate();
  const createDonacion = useDonacionesStore((state) => state.createDonacion);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: CreateDonacionDTO) => {
    setIsSubmitting(true);
    setError('');
    try {
      await createDonacion(data);
      navigate('/dashboard/donaciones');
    } catch (error) {
      setError(errorDonacion(error, 'No se pudo guardar la donación. Intentá de nuevo.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <VStack gap="6" align="stretch" maxW="3xl" mx="auto">
      <PageHeader
        title="Nueva Donación"
        subtitle="Registra un nuevo ingreso de donación en el centro de acopio o almacén."
      />

      {error && <Text color="red.700" role="alert">{error}</Text>}
      <DonacionForm
        modo="crear"
        buscarDonantes={buscarDonantes}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        onCancel={() => navigate('/dashboard/donaciones')}
      />
    </VStack>
  );
};
