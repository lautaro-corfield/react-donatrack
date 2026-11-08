import { useEffect } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  HStack,
  Table,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { useDonacionesStore } from '../model/donacionesStore';
import type { CategoriaDonacion, EstadoDonacion } from '../model/types';

const PlusIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const getEstadoColor = (estado: EstadoDonacion) => {
  switch (estado) {
    case 'RECIBIDA':
      return 'green';
    case 'EN_TRANSITO':
      return 'blue';
    case 'ENTREGADA':
      return 'purple';
    case 'PENDIENTE':
      return 'yellow';
    case 'CANCELADA':
      return 'red';
    default:
      return 'gray';
  }
};

const getCategoriaColor = (categoria: CategoriaDonacion) => {
  switch (categoria) {
    case 'ALIMENTOS':
      return 'teal';
    case 'MEDICAMENTOS':
      return 'red';
    case 'DINERO':
      return 'green';
    case 'ROPA':
      return 'cyan';
    default:
      return 'gray';
  }
};

/**
 * Vista principal de listado para el dominio Donaciones (List.tsx).
 * Conectada a la ruta /dashboard/donaciones.
 */
export const DonacionesListView = () => {
  const navigate = useNavigate();
  const donaciones = useDonacionesStore((state) => state.donaciones);
  const fetchDonaciones = useDonacionesStore((state) => state.fetchDonaciones);
  const deleteDonacion = useDonacionesStore((state) => state.deleteDonacion);

  useEffect(() => {
    fetchDonaciones();
  }, [fetchDonaciones]);

  const handleDelete = async (id: string, descripcion: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la donación: "${descripcion}"?`)) {
      await deleteDonacion(id);
    }
  };

  return (
    <VStack gap="6" align="stretch" maxW="6xl" mx="auto">
      <PageHeader
        title="Donaciones"
        subtitle="Control de inventario, trazabilidad y estado de entregas en tiempo real."
        badge={
          <Badge colorPalette="teal" variant="subtle" px="2.5" py="1" borderRadius="full">
            {donaciones.length} registros
          </Badge>
        }
        action={
          <Button
            colorPalette="teal"
            borderRadius="xl"
            gap="2"
            onClick={() => navigate('/dashboard/donaciones/nueva')}
          >
            <PlusIcon />
            <Text>Nueva Donación</Text>
          </Button>
        }
      />

      <Card.Root borderWidth="1px" borderRadius="2xl" shadow="sm" bg="white" overflow="hidden">
        <Box overflowX="auto">
          <Table.Root size="md" variant="line">
            <Table.Header bg="gray.50">
              <Table.Row>
                <Table.ColumnHeader color="gray.600">Descripción</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.600">Categoría</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.600">Cantidad</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.600">Donante</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.600">Destino</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.600">Estado</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.600" textAlign="right">
                  Acciones
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {donaciones.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={7} textAlign="center" py="8" color="gray.500">
                    No se encontraron donaciones registradas. Haz clic en "Nueva Donación" para comenzar.
                  </Table.Cell>
                </Table.Row>
              ) : (
                donaciones.map((d) => (
                  <Table.Row key={d.id} _hover={{ bg: 'gray.50' }} transition="all 0.15s">
                    <Table.Cell fontWeight="medium" color="gray.800">
                      {d.descripcion}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        colorPalette={getCategoriaColor(d.categoria)}
                        variant="subtle"
                        size="xs"
                      >
                        {d.categoria}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontWeight="semibold" color="gray.700">
                        {d.cantidad.toLocaleString()}{' '}
                        <Text as="span" fontSize="xs" color="gray.500">
                          {d.unidadMedida}
                        </Text>
                      </Text>
                    </Table.Cell>
                    <Table.Cell color="gray.600" fontSize="sm">
                      {d.donanteNombre}
                    </Table.Cell>
                    <Table.Cell color="gray.600" fontSize="sm">
                      {d.entidadDestino}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        colorPalette={getEstadoColor(d.estado)}
                        variant="solid"
                        size="xs"
                        borderRadius="full"
                        px="2"
                      >
                        {d.estado}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                      <HStack justify="flex-end" gap="2">
                        <Button
                          variant="ghost"
                          size="xs"
                          colorPalette="blue"
                          p="1"
                          onClick={() => navigate(`/dashboard/donaciones/editar/${d.id}`)}
                          aria-label="Editar donación"
                        >
                          <EditIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          colorPalette="red"
                          p="1"
                          onClick={() => handleDelete(d.id, d.descripcion)}
                          aria-label="Eliminar donación"
                        >
                          <TrashIcon />
                        </Button>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Root>
        </Box>
      </Card.Root>
    </VStack>
  );
};
