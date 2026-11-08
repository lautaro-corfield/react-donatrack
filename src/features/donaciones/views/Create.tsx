import { useState } from 'react';
import { VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { DonacionForm } from '../components/Form';
import { useDonacionesStore } from '../model/donacionesStore';
import type { CreateDonacionDTO } from '../model/types';

/**
 * Vista para dar de alta una nueva donación (Create.tsx).
 * Importa y renderiza el componente reutilizable DonacionForm.
 */
export const DonacionesCreateView = () => {
  const navigate = useNavigate();
  const createDonacion = useDonacionesStore((state) => state.createDonacion);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateDonacionDTO) => {
    setIsSubmitting(true);
    try {
      await createDonacion(data);
      navigate('/dashboard/donaciones');
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

      <DonacionForm
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        onCancel={() => navigate('/dashboard/donaciones')}
      />
    </VStack>
  );
};
