import { Button, Dialog, HStack, Portal, Text, VStack } from '@chakra-ui/react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onStay: () => void;
  onDiscard: () => void;
}

export const UnsavedChangesModal = ({
  isOpen,
  onStay,
  onDiscard,
}: UnsavedChangesModalProps) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onStay()}>
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content
            borderRadius="2xl"
            p="6"
            maxW="md"
            mx="4"
            boxShadow="2xl"
            bg="white"
          >
            <Dialog.Header pb="3">
              <VStack align="start" gap="2">
                <HStack gap="3">
                  <Text fontSize="2xl">⚠️</Text>
                  <Dialog.Title fontSize="xl" fontWeight="bold" color="gray.800">
                    Cambios sin guardar
                  </Dialog.Title>
                </HStack>
                <Dialog.Description fontSize="sm" color="gray.600">
                  Has realizado modificaciones en el donante que aún no fueron
                  guardadas. Si sales ahora, se perderán todos los cambios.
                </Dialog.Description>
              </VStack>
            </Dialog.Header>

            <Dialog.Footer pt="4">
              <HStack justify="end" gap="3" w="100%">
                <Button
                  variant="outline"
                  borderRadius="full"
                  onClick={onStay}
                  colorPalette="gray"
                  size="md"
                  px="5"
                >
                  Continuar editando
                </Button>
                <Button
                  colorPalette="red"
                  borderRadius="full"
                  onClick={onDiscard}
                  size="md"
                  px="5"
                >
                  Descartar cambios
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
