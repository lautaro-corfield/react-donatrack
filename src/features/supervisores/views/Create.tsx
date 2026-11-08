import { useState } from 'react';
import { VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { toaster } from '@/shared/components/toaster.instance';
import { SupervisorForm } from './Form';
import { useSupervisoresStore } from '../model/supervisoresStore';
import type { CreateSupervisorDTO } from '../model/supervisores.types';

/**
 * Vista de alta de un nuevo supervisor (Create.tsx).
 * Consume createSupervisor, emite notificaciones Toast (éxito/error)
 * y redirige automáticamente al listado.
 */
export const SupervisoresCreateView = () => {
  const navigate = useNavigate();
  const createSupervisor = useSupervisoresStore((state) => state.createSupervisor);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateSupervisorDTO) => {
    setIsSubmitting(true);
    try {
      await createSupervisor(data);

      toaster.create({
        title: 'Supervisor habilitado',
        description: `Se habilitó exitosamente el acceso para ${data.email}.`,
        type: 'success',
      });

      navigate('/dashboard/supervisores');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message || 'Error al comunicarse con el servidor'
          : err instanceof Error
          ? err.message
          : 'No se pudo registrar al supervisor';

      toaster.create({
        title: 'Error de registro',
        description: message,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <VStack gap="6" align="stretch" maxW="2xl" mx="auto">
      <PageHeader
        title="Habilitar Supervisor"
        subtitle="Ingresa el correo electrónico institucional para otorgar permisos de supervisión operativa."
      />

      <SupervisorForm
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        onCancel={() => navigate('/dashboard/supervisores')}
      />
    </VStack>
  );
};
