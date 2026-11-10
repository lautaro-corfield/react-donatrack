import { useEffect, useState } from 'react';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { errorDonacion } from '../api/donacionesApi';
import { DonacionForm } from '../components/Form';
import { useDonacionesStore } from '../model/donacionesStore';
import type { UpdateDonacionDTO, Donacion } from '../model/types';

/**
 * Vista para modificar una donación existente (Edit.tsx).
 * Recupera el registro por ID, importa DonacionForm y le inyecta los datos iniciales.
 */
export const DonacionesEditView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fetchDonacionById = useDonacionesStore((state) => state.fetchDonacionById);
  const updateDonacion = useDonacionesStore((state) => state.updateDonacion);

  const [donacion, setDonacion] = useState<Donacion | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoadingData(true);
      const data = await fetchDonacionById(id);
      setDonacion(data);
      setIsLoadingData(false);
    };
    load();
  }, [id, fetchDonacionById]);

  const handleSubmit = async (data: UpdateDonacionDTO) => {
    if (!id) return;
    setIsSubmitting(true);
    setError('');
    try {
      await updateDonacion(id, data);
      navigate('/dashboard/donaciones');
    } catch (error) {
      setError(errorDonacion(error, 'No se pudo actualizar la donación.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <VStack justify="center" align="center" minH="300px" gap="3">
        <Spinner size="lg" colorPalette="teal" />
        <Text fontSize="sm" color="gray.500">
          Cargando datos de la donación...
        </Text>
      </VStack>
    );
  }

  if (!donacion) {
    return (
      <VStack justify="center" align="center" minH="300px" gap="3">
        <Text fontSize="lg" fontWeight="semibold" color="gray.700">
          No se encontró la donación solicitada.
        </Text>
        <Box as="button" color="teal.600" onClick={() => navigate('/dashboard/donaciones')}>
          Volver al listado
        </Box>
      </VStack>
    );
  }

  return (
    <VStack gap="6" align="stretch" maxW="3xl" mx="auto">
      <PageHeader
        title="Editar Donación"
        subtitle={`Modificando registro: ${donacion.descripcion} (${donacion.id})`}
      />

      {error && <Text color="red.700" role="alert">{error}</Text>}
      <DonacionForm
        modo="editar"
        descripcion={donacion.descripcion}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        onCancel={() => navigate('/dashboard/donaciones')}
      />
    </VStack>
  );
};
