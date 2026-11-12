import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  HStack,
  Input,
  NativeSelect,
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
import { useAuthStore } from '@/features/auth/model/authStore';

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
  if (donacion.donacionesSegmentadas.length > 0 &&
      donacion.donacionesSegmentadas.every(segmento => segmento.estado === 'EN_DEPOSITO')) {
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
  const esAdmin = useAuthStore((state) => state.user?.role === 'ADMIN' || state.user?.roles?.includes('ADMIN') || state.user?.roles?.includes('ROLE_ADMIN'));
  const [categoria, setCategoria] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [estado, setEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetchDonaciones();
  }, [fetchDonaciones]);

  const categorias = useMemo(() => [...new Set(donaciones.flatMap(d => d.donacionesSegmentadas.map(s => s.categoria).filter((c): c is NonNullable<typeof c> => Boolean(c))))].sort(), [donaciones]);
  const subcategorias = useMemo(() => [...new Set(donaciones.flatMap(d => d.donacionesSegmentadas
    .filter(s => !categoria || s.categoria === categoria).map(s => s.subCategoria).filter(Boolean)))].sort((a, b) => a.localeCompare(b, 'es-AR')), [donaciones, categoria]);
  const donacionesVisibles = useMemo(() => donaciones.map(d => ({
    ...d,
    donacionesSegmentadas: d.donacionesSegmentadas.filter(s => (!categoria || s.categoria === categoria) && (!subcategoria || s.subCategoria === subcategoria)),
  })).filter(d => (d.donacionesSegmentadas.length > 0 || (!categoria && !subcategoria))
    && (!estado || d.estado === estado)
    && (!busqueda.trim() || `${d.descripcion} ${d.donanteNombre ?? ''} ${d.donacionesSegmentadas.map(s => s.subCategoria).join(' ')}`.toLocaleLowerCase('es-AR').includes(busqueda.trim().toLocaleLowerCase('es-AR')))), [donaciones, categoria, subcategoria, estado, busqueda]);

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
            {esAdmin ? `${donacionesVisibles.length} de ${donaciones.length} registros` : `${donaciones.length} registros`}
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

      {error && <Text role="alert" color="red.700">{error}</Text>}
      {esAdmin && (
        <Card.Root borderWidth="1px" borderRadius="2xl" shadow="sm" bg="white">
          <Card.Body>
            <Stack gap="4">
              <Text fontWeight="semibold" color="gray.700">Filtrar donaciones</Text>
              <HStack gap="3" align="end" flexWrap="wrap">
                <Box flex="1" minW="200px">
                  <Text fontSize="sm" mb="1" color="gray.600">Buscar</Text>
                  <Input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Descripción, donante o bien" borderRadius="xl" />
                </Box>
                <Box flex="1" minW="180px">
                  <Text fontSize="sm" mb="1" color="gray.600">Categoría</Text>
                  <NativeSelect.Root><NativeSelect.Field aria-label="Filtrar por categoría" value={categoria} onChange={e => { setCategoria(e.target.value); setSubcategoria(''); }} borderRadius="xl">
                    <option value="">Todas las categorías</option>{categorias.map(c => <option key={c} value={c}>{c}</option>)}
                  </NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root>
                </Box>
                <Box flex="1" minW="180px">
                  <Text fontSize="sm" mb="1" color="gray.600">Subcategoría</Text>
                  <NativeSelect.Root><NativeSelect.Field aria-label="Filtrar por subcategoría" value={subcategoria} onChange={e => setSubcategoria(e.target.value)} borderRadius="xl">
                    <option value="">Todas las subcategorías</option>{subcategorias.map(s => <option key={s} value={s}>{s}</option>)}
                  </NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root>
                </Box>
                <Box flex="1" minW="170px">
                  <Text fontSize="sm" mb="1" color="gray.600">Estado</Text>
                  <NativeSelect.Root><NativeSelect.Field aria-label="Filtrar por estado" value={estado} onChange={e => setEstado(e.target.value)} borderRadius="xl">
                    <option value="">Todos los estados</option><option value="PENDIENTE">Pendiente</option><option value="ADJUDICADA">Adjudicada</option>
                  </NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root>
                </Box>
                <Button variant="outline" borderRadius="xl" onClick={() => { setBusqueda(''); setCategoria(''); setSubcategoria(''); setEstado(''); }}>Limpiar</Button>
              </HStack>
            </Stack>
          </Card.Body>
        </Card.Root>
      )}
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
              {donacionesVisibles.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center" py="8" color="gray.500">
                    {isLoading ? 'Cargando donaciones…' : error ? 'Listado no disponible.' : donaciones.length > 0 ? 'No hay donaciones que coincidan con los filtros.' : 'Todavía no hay donaciones registradas.'}
                  </Table.Cell>
                </Table.Row>
              ) : (
                donacionesVisibles.map((d) => {
                  const grupos = d.donacionesSegmentadas.reduce<Record<string, typeof d.donacionesSegmentadas>>((acc, segmento) => {
                    (acc[segmento.subCategoria] ??= []).push(segmento);
                    return acc;
                  }, {});
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
                      {d.donanteNombre ?? '—'}
                    </Table.Cell>
                    <Table.Cell color="gray.600" fontSize="sm">
                      {[...new Set(d.donacionesSegmentadas.map(segmento =>
                        segmento.entidadBeneficiariaNombre ||
                        (segmento.entidadBeneficiariaAsignadaId ? `Entidad ${segmento.entidadBeneficiariaAsignadaId}` : 'Sin asignar')
                      ))].join(', ') || 'Sin asignar'}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={d.estado === 'ADJUDICADA' ? 'green' : 'yellow'} variant="subtle">
                        {estadoVisible(d)}
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
