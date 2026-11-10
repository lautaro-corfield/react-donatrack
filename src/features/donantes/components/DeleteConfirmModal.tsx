import {
  Button,
  Dialog,
  HStack,
  Portal,
  Text,
  VStack,
} from '@chakra-ui/react';
import type { Donante } from '../model/types';

interface DeleteConfirmModalProps {
  donante: Donante | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteConfirmModal = ({
  donante,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteConfirmModalProps) => {
  if (!donante) return null;

  const displayName =
    donante.persona.tipoPersona === 'HUMANA' || donante.persona.nombre
      ? `${donante.persona.nombre || ''} ${donante.persona.apellido || ''}`.trim()
      : donante.persona.razonSocial || 'Donante';

  const email =
    donante.persona.medioPredeterminado?.valor ||
    donante.persona.medioDeContacto?.EMAIL?.[0] ||
    '';

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
            borderColor="red.100"
          >
            <Dialog.Header pb="2">
              <VStack align="start" gap="2">
                <HStack gap="3">
                  <Text fontSize="2xl">🗑️</Text>
                  <Dialog.Title fontSize="xl" fontWeight="bold" color="red.700">
                    Confirmar Eliminación
                  </Dialog.Title>
                </HStack>
                <Dialog.Description fontSize="sm" color="gray.600">
                  ¿Estás completamente seguro de que deseas eliminar a{' '}
                  <Text as="span" fontWeight="bold" color="gray.900">
                    "{displayName}"
                  </Text>
                  {email ? ` (${email})` : ''}?
                </Dialog.Description>
              </VStack>
            </Dialog.Header>

            <Dialog.Body py="3">
              <Text fontSize="xs" color="red.600" bg="red.50" p="3" borderRadius="xl">
                ⚠️ Esta acción es permanente y eliminará todo el historial de contacto y trazabilidad asociado a este donante.
              </Text>
            </Dialog.Body>

            <Dialog.Footer pt="3">
              <HStack justify="end" gap="3" w="100%">
                <Button
                  variant="outline"
                  borderRadius="full"
                  onClick={onClose}
                  colorPalette="gray"
                  size="md"
                  px="5"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  colorPalette="red"
                  borderRadius="full"
                  onClick={onConfirm}
                  size="md"
                  px="6"
                  disabled={isLoading}
                  shadow="sm"
                >
                  {isLoading ? 'Eliminando...' : 'Sí, Eliminar'}
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

