import { useEffect } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  HStack,
  Stack,
  Table,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { useDonacionesStore } from '../model/donacionesStore';
import type { Donacion } from '../model/types';
import { MatchmakingPanel } from '../components/MatchmakingPanel';

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

function estadoVisible(donacion: Donacion) {
  const segmentos = donacion.donacionesSegmentadas;
  const entregados = segmentos.filter(segmento => segmento.estado === 'ENTREGADA').length;
  if (entregados > 0) {
    return entregados === segmentos.length ? 'Entregada' : `Entrega parcial (${entregados}/${segmentos.length})`;
  }
  if (segmentos.length > 0 && segmentos.every(segmento => segmento.estado === 'EN_DEPOSITO')) {
    return 'En depósito';
  }
  return donacion.estado === 'ADJUDICADA' ? 'Adjudicada' : 'Pendiente';
}

/**
 * Vista principal de listado para el dominio Donaciones (List.tsx).
 * Conectada a la ruta /dashboard/donaciones.
 */
export const DonacionesListView = () => {
  const navigate = useNavigate();
  const donaciones = useDonacionesStore((state) => state.donaciones);
  const isLoading = useDonacionesStore((state) => state.isLoading);
  const error = useDonacionesStore((state) => state.error);
  const fetchDonaciones = useDonacionesStore((state) => state.fetchDonaciones);
  const deleteDonacion = useDonacionesStore((state) => state.deleteDonacion);

  useEffect(() => {
    fetchDonaciones();
  }, [fetchDonaciones]);

  const handleDelete = async (id: number, descripcion: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la donación: "${descripcion}"?`)) {
      await deleteDonacion(id);
    }
  };

  return (
    <VStack gap="6" align="stretch" maxW="6xl" mx="auto">
      <PageHeader
        title="Donaciones"
        subtitle="Ingresos al depósito, donantes y destinos asignados."
        badge={
          <Badge colorPalette="teal" variant="subtle" px="2.5" py="1" borderRadius="full">
            {donaciones.length} registros
          </Badge>
        }
        action={
          <HStack wrap="wrap">
            <Button variant="outline" onClick={() => void fetchDonaciones()} loading={isLoading}>Actualizar</Button>
            <Button
              colorPalette="teal"
              borderRadius="xl"
              gap="2"
              onClick={() => navigate('/dashboard/donaciones/nueva')}
            >
              <PlusIcon />
              <Text>Nueva Donación</Text>
            </Button>
          </HStack>
        }
      />

      {error && <Text role="alert" color="red.700">{error}</Text>}
      <Card.Root borderWidth="1px" borderRadius="2xl" shadow="sm" bg="white" overflow="hidden">
        <Box overflowX="auto">
          <Table.Root size="md" variant="line">
            <Table.Header bg="gray.50">
              <Table.Row>
                <Table.ColumnHeader color="gray.600">Descripción</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.600">Bienes</Table.ColumnHeader>
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
                  <Table.Cell colSpan={6} textAlign="center" py="8" color="gray.500">
                    {isLoading ? 'Cargando donaciones…' : error ? 'Listado no disponible.' : 'Todavía no hay donaciones registradas.'}
                  </Table.Cell>
                </Table.Row>
              ) : (
                donaciones.map((d) => {
                  const grupos = d.donacionesSegmentadas.reduce<Record<string, typeof d.donacionesSegmentadas>>((acc, segmento) => {
                    (acc[segmento.subCategoria] ??= []).push(segmento);
                    return acc;
                  }, {});
                  const estado = estadoVisible(d);
                  return (
                  <Table.Row key={d.id} _hover={{ bg: 'gray.50' }} transition="all 0.15s">
                    <Table.Cell fontWeight="medium" color="gray.800">
                      {d.descripcion}
                    </Table.Cell>
                    <Table.Cell>
                      <Stack gap="3" fontSize="sm">
                        {Object.entries(grupos).map(([subcategoria, segmentos]) => (
                          <Stack key={subcategoria} gap="1" borderLeftWidth="2px" borderColor="teal.200" pl="3">
                            <Text fontWeight="semibold">{subcategoria} · {segmentos.reduce((sum, s) => sum + s.cantidad, 0).toLocaleString('es-AR')} {segmentos[0]?.unidad?.toLowerCase()} agrupados</Text>
                            {segmentos.map(segmento => (
                              <Stack key={segmento.id} gap="1">
                                <Text>Segmento #{segmento.id} · {segmento.cantidad.toLocaleString('es-AR')} {segmento.unidad?.toLowerCase()} · {segmento.estado}</Text>
                                {segmento.estado === 'EN_DEPOSITO' && (
                                  <details>
                                    <Text as="summary" cursor="pointer" color="teal.700" fontWeight="medium">Asignar entidad beneficiaria</Text>
                                    <MatchmakingPanel segmentoId={segmento.id} onAsignada={() => void fetchDonaciones()} />
                                  </details>
                                )}
                              </Stack>
                            ))}
                          </Stack>
                        ))}
                      </Stack>
                    </Table.Cell>
                    <Table.Cell color="gray.600" fontSize="sm">
                      {d.donanteNombre ?? '—'}{d.donanteId != null && <Text fontSize="xs">Donante #{d.donanteId}</Text>}
                    </Table.Cell>
                    <Table.Cell color="gray.600" fontSize="sm">
                      {d.donacionesSegmentadas.length === 0 ? 'Sin asignar' : (
                        <Stack gap="1">
                          {d.donacionesSegmentadas.map(segmento => (
                            <Text key={segmento.id}>
                              Segmento #{segmento.id} · {segmento.entidadBeneficiariaAsignadaId == null ? 'Sin asignar' :
                                `Entidad #${segmento.entidadBeneficiariaAsignadaId}${segmento.entidadBeneficiariaNombre ? ` · ${segmento.entidadBeneficiariaNombre}` : ''}`}
                            </Text>
                          ))}
                        </Stack>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={estado === 'Entregada' ? 'green' : estado.startsWith('Entrega parcial') ? 'blue' : d.estado === 'ADJUDICADA' ? 'teal' : 'yellow'} variant="subtle">
                        {estado}
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
                  );
                })
              )}
            </Table.Body>
          </Table.Root>
        </Box>
      </Card.Root>
    </VStack>
  );
};
