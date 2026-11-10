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
  getDonanteCalle,
  getDonanteDireccion,
  getDonanteEmail,
  getDonanteTelefono,
} from '../model/donanteUtils';

export const DonantesListView = () => {
  const navigate = useNavigate();

  const donantes = useDonantesStore((state) => state.donantes);
  const fetchDonantes = useDonantesStore((state) => state.fetchDonantes);
  const updateDonante = useDonantesStore((state) => state.updateDonante);
  const deleteDonante = useDonantesStore((state) => state.deleteDonante);
  const isLoading = useDonantesStore((state) => state.isLoading);
  const isInitialized = useDonantesStore((state) => state.isInitialized);

  const isPending = isLoading || !isInitialized;

  const [searchTerm, setSearchTerm] = useState('');
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

      {/* Encabezado */}
      <PageHeader
        title="Lista General de Donantes"
        subtitle="Consulta el padrón unificado de personas físicas y jurídicas. Haz clic sobre cualquier fila para editar o eliminar."
        badge={
          <Badge colorPalette="teal" variant="subtle" px="3" py="1" borderRadius="full">
            {isPending ? (
              <HStack gap="1.5">
                <Spinner size="xs" colorPalette="teal" />
                <Text fontSize="xs">Cargando...</Text>
              </HStack>
            ) : (
              `${filteredDonantes.length} de ${donantes.length} donantes`
            )}
          </Badge>
        }
      />

      {/* Buscador Universal en Tiempo Real */}
      <Card.Root borderRadius="2xl" p="4" borderWidth="1px" borderColor="gray.200" bg="white" shadow="sm">
        <HStack gap="3">
          <Text fontSize="xl" pl="2">
            🔍
          </Text>
          <Input
            placeholder="Buscar por nombre, apellido, razón social, DNI, organización, email, teléfono o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              onClick={() => setSearchTerm('')}
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
                filteredDonantes.map((donante) => {
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

