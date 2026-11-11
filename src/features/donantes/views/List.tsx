import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  HStack,
  Input,
  Spinner,
  Table,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { toaster } from '@/shared/components/toaster.instance';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { DonanteActionsModal } from '../components/DonanteActionsModal';
import { DonanteEditModal } from '../components/DonanteEditModal';
import { useDonantesStore } from '../model/donantesStore';
import type { Donante, DonanteFormData } from '../model/types';
import {
  getDonanteDireccion,
  getDonanteEmail,
  getDonanteTelefono,
} from '../model/donanteUtils';

const PAGE_SIZE = 50;

export const DonantesListView = () => {
  const navigate = useNavigate();

  const donantes = useDonantesStore((state) => state.donantes);
  const fetchDonantes = useDonantesStore((state) => state.fetchDonantes);
  const updateDonante = useDonantesStore((state) => state.updateDonante);
  const deleteDonante = useDonantesStore((state) => state.deleteDonante);
  const isLoading = useDonantesStore((state) => state.isLoading);
  const isInitialized = useDonantesStore((state) => state.isInitialized);
  const isUsingMockData = useDonantesStore((state) => state.isUsingMockData);
  const error = useDonantesStore((state) => state.error);

  const isPending = isLoading || !isInitialized;

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDonante, setSelectedDonante] = useState<Donante | null>(null);

  // Estados para modales
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchDonantes();
  }, [fetchDonantes]);

  // Filtro universal: busca coincidencia en cualquier atributo de personas físicas o jurídicas
  const filteredDonantes = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return donantes;

    return donantes.filter((d) => {
      const p = d.persona;
      const nombre = (p.nombre || '').toLowerCase();
      const apellido = (p.apellido || '').toLowerCase();
      const razonSocial = (p.razonSocial || '').toLowerCase();
      const doc = (p.nroDocumento || '').toLowerCase();
      const tipoPersona = (p.tipoPersona || '').toLowerCase();
      const tipoOrg = (p.tipo || '').toLowerCase();
      const rubro = (p.rubro || '').toLowerCase();

      // Email y Teléfono
      const emailPred = getDonanteEmail(d).toLowerCase();
      const telefonoPred = getDonanteTelefono(d).toLowerCase();

      // Dirección
      const direccionCompleta = getDonanteDireccion(d).toLowerCase();
      const cp = (p.direccion?.codigoPostal || '').toLowerCase();

      return (
        nombre.includes(query) ||
        apellido.includes(query) ||
        `${nombre} ${apellido}`.includes(query) ||
        razonSocial.includes(query) ||
        doc.includes(query) ||
        tipoPersona.includes(query) ||
        tipoOrg.includes(query) ||
        rubro.includes(query) ||
        emailPred.includes(query) ||
        telefonoPred.includes(query) ||
        direccionCompleta.includes(query) ||
        cp.includes(query)
      );
    });
  }, [donantes, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredDonantes.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedDonantes = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredDonantes.slice(start, start + PAGE_SIZE);
  }, [filteredDonantes, safePage]);

  // Manejador de click en fila
  const handleRowClick = (donante: Donante) => {
    setSelectedDonante(donante);
    setIsActionsOpen(true);
  };

  const handleEditClick = (donante: Donante) => {
    setSelectedDonante(donante);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (donante: Donante) => {
    setSelectedDonante(donante);
    setIsDeleteOpen(true);
  };

  const handleSaveEdit = async (
    originalEmail: string,
    formData: DonanteFormData
  ) => {
    setIsSaving(true);
    try {
      await updateDonante(originalEmail, formData);
      toaster.create({
        title: 'Donante actualizado',
        description: 'Los cambios fueron guardados exitosamente.',
        type: 'success',
      });
      setIsEditOpen(false);
      setSelectedDonante(null);
    } catch {
      toaster.create({
        title: 'Error al actualizar',
        description: 'No se pudieron guardar las modificaciones.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDonante) return;

    const email = getDonanteEmail(selectedDonante);

    setIsDeleting(true);
    try {
      await deleteDonante(email);
      toaster.create({
        title: 'Donante eliminado',
        description: 'El donante fue removido del padrón.',
        type: 'success',
      });
      setIsDeleteOpen(false);
      setSelectedDonante(null);
    } catch {
      toaster.create({
        title: 'Error al eliminar',
        description: 'No se pudo eliminar el registro del donante.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <VStack gap="6" align="stretch" maxW="6xl" mx="auto" py="4">
      {/* Botones de Navegación Superior */}
      <HStack justify="space-between" align="center" wrap="wrap" gap="3">
        <Button
          variant="outline"
          borderRadius="full"
          size="sm"
          px="5"
          onClick={() => navigate('/dashboard/donantes')}
          _hover={{ transform: 'translateX(-3px)', bg: 'gray.100' }}
          transition="all 0.2s ease"
        >
          ← Volver al Menú de Donantes
        </Button>

        <HStack gap="2">
          <Button
            variant="outline"
            borderRadius="full"
            size="sm"
            px="4"
            loading={isLoading}
            onClick={() => fetchDonantes(true)}
          >
            🔄 Actualizar padrón
          </Button>
          <Button
            colorPalette="teal"
            borderRadius="full"
            size="sm"
            px="6"
            shadow="sm"
            onClick={() => navigate('/dashboard/donantes/nuevo')}
            _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
            transition="all 0.2s ease"
          >
            ✨ + Registrar Nuevo Donante
          </Button>
        </HStack>
      </HStack>

      {/* Encabezado */}
      <PageHeader
        title="Lista General de Donantes"
        subtitle="Consulta el padrón unificado de personas físicas y jurídicas. Haz clic sobre cualquier fila para editar o eliminar."
        badge={
          <Badge
            colorPalette={isUsingMockData || error ? 'orange' : 'teal'}
            variant="subtle"
            px="3"
            py="1"
            borderRadius="full"
          >
            {isPending ? (
              <HStack gap="1.5">
                <Spinner size="xs" colorPalette="teal" />
                <Text fontSize="xs">Cargando...</Text>
              </HStack>
            ) : isUsingMockData ? (
              `⚠️ ${filteredDonantes.length} de ${donantes.length} (Mockup)`
            ) : (
              `${filteredDonantes.length} de ${donantes.length} donantes`
            )}
          </Badge>
        }
      />

      {/* Aviso explícito cuando falló la conexión con el backend o se muestran datos mockup */}
      {!isPending && (error || isUsingMockData) && (
        <Card.Root
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="orange.300"
          bg="orange.50"
          p="4"
          shadow="xs"
        >
          <HStack justify="space-between" align="center" wrap="wrap" gap="3">
            <HStack gap="3" align="start">
              <Text fontSize="xl">⚠️</Text>
              <VStack align="start" gap="0.5">
                <HStack gap="2">
                  <Text fontSize="sm" fontWeight="bold" color="orange.900">
                    No se pudieron traer los donantes desde el servidor
                  </Text>
                  {isUsingMockData && (
                    <Badge colorPalette="orange" variant="solid" borderRadius="full" size="xs">
                      DATOS MOCKUP
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="xs" color="orange.800">
                  {error || 'Se están mostrando datos locales de demostración porque el backend no respondió.'}
                </Text>
              </VStack>
            </HStack>

            <Button
              size="xs"
              colorPalette="orange"
              variant="outline"
              borderRadius="full"
              loading={isLoading}
              onClick={() => fetchDonantes(true)}
            >
              🔄 Reintentar conexión
            </Button>
          </HStack>
        </Card.Root>
      )}

      {/* Buscador Universal en Tiempo Real */}
      <Card.Root borderRadius="2xl" p="4" borderWidth="1px" borderColor="gray.200" bg="white" shadow="sm">
        <HStack gap="3">
          <Text fontSize="xl" pl="2">
            🔍
          </Text>
          <Input
            placeholder="Buscar por nombre, apellido, razón social, DNI, organización, email, teléfono o dirección..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            borderRadius="full"
            size="lg"
            bg="gray.50"
            _focus={{ bg: 'white', borderColor: 'teal.500' }}
            variant="subtle"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              borderRadius="full"
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
            >
              Limpiar
            </Button>
          )}
        </HStack>
      </Card.Root>

      {/* Tabla Interactiva de Donantes */}
      <Card.Root
        borderRadius="3xl"
        borderWidth="1px"
        borderColor="gray.200"
        shadow="md"
        bg="white"
        overflow="hidden"
      >
        <Box overflowX="auto">
          <Table.Root size="md" interactive>
            <Table.Header bg="gray.50">
              <Table.Row>
                <Table.ColumnHeader fontWeight="bold">Tipo</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="bold">Nombre / Razón Social</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="bold">Documento / Rubro</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="bold">Correo Electrónico</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="bold">Teléfono</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="bold">Domicilio</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Acciones</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {isPending ? (
                <Table.Row>
                  <Table.Cell colSpan={7} textAlign="center" py="14">
                    <VStack gap="3" justify="center" align="center">
                      <Spinner size="lg" colorPalette="teal" />
                      <Text color="gray.500" fontSize="sm" fontWeight="medium">
                        Cargando donantes desde el servidor...
                      </Text>
                    </VStack>
                  </Table.Cell>
                </Table.Row>
              ) : filteredDonantes.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={7} textAlign="center" py="12">
                    <VStack gap="2">
                      <Text fontSize="3xl">🔍</Text>
                      <Text fontWeight="semibold" color="gray.600">
                        No se encontraron donantes que coincidan con "{searchTerm}"
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        Prueba con otros términos de búsqueda o registra un nuevo donante.
                      </Text>
                    </VStack>
                  </Table.Cell>
                </Table.Row>
              ) : (
                paginatedDonantes.map((donante) => {
                  const isHumana =
                    donante.persona.tipoPersona === 'HUMANA' ||
                    !!donante.persona.nombre;

                  const displayName = isHumana
                    ? `${donante.persona.nombre || ''} ${
                        donante.persona.apellido || ''
                      }`.trim()
                    : donante.persona.razonSocial || 'Donante Sin Nombre';

                  const displayDoc = isHumana
                    ? `DNI: ${donante.persona.nroDocumento || 'S/D'}`
                    : `${donante.persona.tipo || 'Org'} ${
                        donante.persona.rubro ? `• ${donante.persona.rubro}` : ''
                      }`;

                  const email = getDonanteEmail(donante) || '-';
                  const telefono = getDonanteTelefono(donante) || '-';

                  const direccion = getDonanteDireccion(donante);

                  return (
                    <Table.Row
                      key={String(donante.id)}
                      onClick={() => handleRowClick(donante)}
                      cursor="pointer"
                      transition="all 0.2s ease"
                      _hover={{ bg: 'teal.50/50' }}
                    >
                      <Table.Cell>
                        <Badge
                          colorPalette={isHumana ? 'teal' : 'purple'}
                          variant="subtle"
                          borderRadius="full"
                          px="3"
                          py="0.5"
                          fontSize="xs"
                          fontWeight="bold"
                        >
                          {isHumana ? '👤 Física' : '🏢 Jurídica'}
                        </Badge>
                      </Table.Cell>

                      <Table.Cell fontWeight="bold" color="gray.800">
                        {displayName}
                      </Table.Cell>

                      <Table.Cell fontSize="sm" color="gray.600">
                        {displayDoc}
                      </Table.Cell>

                      <Table.Cell fontSize="sm" color="gray.600">
                        {email}
                      </Table.Cell>

                      <Table.Cell fontSize="sm" color="gray.600">
                        {telefono}
                      </Table.Cell>

                      <Table.Cell fontSize="xs" color="gray.500" maxW="200px" truncate>
                        {direccion}
                      </Table.Cell>

                      <Table.Cell textAlign="right" onClick={(e) => e.stopPropagation()}>
                        <HStack justify="end" gap="1">
                          <Button
                            size="xs"
                            variant="ghost"
                            borderRadius="full"
                            colorPalette="teal"
                            onClick={() => handleEditClick(donante)}
                            title="Editar donante"
                          >
                            ✏️ Editar
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            borderRadius="full"
                            colorPalette="red"
                            onClick={() => handleDeleteClick(donante)}
                            title="Eliminar donante"
                          >
                            🗑️
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

        {!isPending && filteredDonantes.length > 0 && (
          <HStack
            justify="space-between"
            align="center"
            px="6"
            py="4"
            bg="gray.50"
            borderTopWidth="1px"
            borderColor="gray.200"
            wrap="wrap"
            gap="3"
          >
            <Text fontSize="xs" color="gray.600" fontWeight="medium">
              Mostrando {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filteredDonantes.length)} de{' '}
              {filteredDonantes.length} donantes
            </Text>

            <HStack gap="2">
              <Button
                size="xs"
                variant="outline"
                borderRadius="full"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage(1)}
              >
                « Primera
              </Button>
              <Button
                size="xs"
                variant="outline"
                borderRadius="full"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                ‹ Anterior
              </Button>
              <Badge
                colorPalette="teal"
                variant="subtle"
                px="3"
                py="1"
                borderRadius="full"
                fontSize="xs"
              >
                Página {safePage} de {totalPages}
              </Badge>
              <Button
                size="xs"
                variant="outline"
                borderRadius="full"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente ›
              </Button>
              <Button
                size="xs"
                variant="outline"
                borderRadius="full"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage(totalPages)}
              >
                Última »
              </Button>
            </HStack>
          </HStack>
        )}
      </Card.Root>

      {/* Modal 1: Opciones de Fila (Editar / Eliminar) */}
      <DonanteActionsModal
        donante={selectedDonante}
        isOpen={isActionsOpen}
        onClose={() => setIsActionsOpen(false)}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Modal 2: Edición Completa con comprobación de cambios no guardados */}
      <DonanteEditModal
        donante={selectedDonante}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveEdit}
        isLoading={isSaving}
      />

      {/* Modal 3: Confirmación de Eliminación */}
      <DeleteConfirmModal
        donante={selectedDonante}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </VStack>
  );
};

