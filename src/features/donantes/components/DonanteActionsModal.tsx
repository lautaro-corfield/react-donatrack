import {
  Badge,
  Box,
  Button,
  Dialog,
  HStack,
  Portal,
  Separator,
  Text,
  VStack,
} from '@chakra-ui/react';
import type { Donante } from '../model/types';
import {
  getDonanteDireccion,
  getDonanteEmail,
  getDonanteTelefono,
} from '../model/donanteUtils';

interface DonanteActionsModalProps {
  donante: Donante | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (donante: Donante) => void;
  onDelete: (donante: Donante) => void;
}

export const DonanteActionsModal = ({
  donante,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: DonanteActionsModalProps) => {
  if (!donante) return null;

  const isHumana =
    donante.persona.tipoPersona === 'HUMANA' || !!donante.persona.nombre;

  const displayName = isHumana
    ? `${donante.persona.nombre || ''} ${donante.persona.apellido || ''}`.trim()
    : donante.persona.razonSocial || 'Donante Sin Nombre';

  const displayId = isHumana
    ? `DNI: ${donante.persona.nroDocumento || 'S/D'}`
    : `${donante.persona.tipo || 'Org'} ${
        donante.persona.rubro ? `• ${donante.persona.rubro}` : ''
      }`;

  const email = getDonanteEmail(donante) || 'Sin correo';
  const telefono = getDonanteTelefono(donante) || 'Sin teléfono';
  const direccion = getDonanteDireccion(donante);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content
            borderRadius="3xl"
            p="6"
            maxW="md"
            mx="4"
            boxShadow="2xl"
            bg="white"
            borderWidth="1px"
            borderColor="gray.100"
          >
            <Dialog.Header pb="3">
              <VStack align="start" gap="1">
                <HStack justify="space-between" w="100%">
                  <Dialog.Title fontSize="xl" fontWeight="bold" color="gray.800">
                    Opciones de Donante
                  </Dialog.Title>
                  <Badge
                    colorPalette={isHumana ? 'teal' : 'purple'}
                    variant="subtle"
                    px="3"
                    py="1"
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {isHumana ? '👤 Persona Física' : '🏢 Persona Jurídica'}
                  </Badge>
                </HStack>
                <Dialog.Description fontSize="xs" color="gray.500">
                  Selecciona una acción para administrar este registro.
                </Dialog.Description>
              </VStack>
            </Dialog.Header>

            <Dialog.Body py="4">
              <VStack gap="4" align="stretch">
                {/* Card de Resumen del Donante */}
                <Box
                  p="4"
                  borderRadius="2xl"
                  bg="gray.50"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <VStack align="start" gap="2">
                    <Text fontSize="lg" fontWeight="bold" color="gray.900">
                      {displayName}
                    </Text>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      {displayId}
                    </Text>
                    <Separator my="1" />
                    <HStack gap="2" fontSize="xs" color="gray.600">
                      <Text fontWeight="semibold">✉️ Correo:</Text>
                      <Text>{email}</Text>
                    </HStack>
                    <HStack gap="2" fontSize="xs" color="gray.600">
                      <Text fontWeight="semibold">📞 Teléfono:</Text>
                      <Text>{telefono}</Text>
                    </HStack>
                    <HStack gap="2" fontSize="xs" color="gray.600" align="start">
                      <Text fontWeight="semibold" whiteSpace="nowrap">📍 Domicilio:</Text>
                      <Text>{direccion}</Text>
                    </HStack>
                  </VStack>
                </Box>

                {/* Acciones Principales con Píldoras Elegantes */}
                <VStack gap="3" pt="2">
                  <Button
                    colorPalette="teal"
                    borderRadius="full"
                    w="100%"
                    size="lg"
                    shadow="sm"
                    onClick={() => {
                      onClose();
                      onEdit(donante);
                    }}
                    _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                    transition="all 0.2s ease"
                  >
                    ✏️ Editar Datos del Donante
                  </Button>

                  <Button
                    colorPalette="red"
                    variant="subtle"
                    borderRadius="full"
                    w="100%"
                    size="lg"
                    onClick={() => {
                      onClose();
                      onDelete(donante);
                    }}
                    _hover={{ bg: 'red.100', transform: 'translateY(-2px)' }}
                    transition="all 0.2s ease"
                  >
                    🗑️ Eliminar este Donante
                  </Button>
                </VStack>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer pt="3">
              <Button
                variant="ghost"
                borderRadius="full"
                onClick={onClose}
                colorPalette="gray"
                size="sm"
                w="100%"
              >
                Cerrar ventana
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

