import { useState } from 'react';
import {
  Dialog,
  Portal,
  VStack,
} from '@chakra-ui/react';
import type { Donante, DonanteFormData, TipoOrganizacion } from '../model/types';
import {
  getDonanteAltura,
  getDonanteCalle,
  getDonanteDepto,
  getDonanteEmail,
  getDonantePiso,
  getDonanteTelefono,
} from '../model/donanteUtils';
import { DonanteForm } from './DonanteForm';
import { UnsavedChangesModal } from './UnsavedChangesModal';

interface DonanteEditModalProps {
  donante: Donante | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (originalEmail: string, data: DonanteFormData) => Promise<void>;
  isLoading?: boolean;
}

export const DonanteEditModal = ({
  donante,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: DonanteEditModalProps) => {
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  if (!donante) return null;

  const isHumana =
    donante.persona.tipoPersona === 'HUMANA' || !!donante.persona.nombre;

  const originalEmail = getDonanteEmail(donante);
  const originalTelefono = getDonanteTelefono(donante);

  const initialFormData: Partial<DonanteFormData> = {
    tipoPersona: isHumana ? 'HUMANA' : 'JURIDICA',
    nombre: donante.persona.nombre || '',
    apellido: donante.persona.apellido || '',
    nroDocumento: donante.persona.nroDocumento || '',
    genero: donante.persona.genero || 'Prefiero no decir',
    fechaNacimiento: donante.persona.fechaNacimiento || '',
    razonSocial: donante.persona.razonSocial || '',
    tipoOrganizacion: (donante.persona.tipo as TipoOrganizacion) || 'ONG',
    rubro: donante.persona.rubro || '',
    representanteNombre: donante.persona.personasRepresentantes?.[0]?.nombre || '',
    representanteApellido: donante.persona.personasRepresentantes?.[0]?.apellido || '',
    representanteDocumento: donante.persona.personasRepresentantes?.[0]?.nroDocumento
      ? String(donante.persona.personasRepresentantes[0].nroDocumento)
      : '',
    email: originalEmail,
    telefono: originalTelefono,
    calle: getDonanteCalle(donante),
    altura: getDonanteAltura(donante),
    piso: getDonantePiso(donante),
    depto: getDonanteDepto(donante),
    codigoPostal: donante.persona.direccion?.codigoPostal || '',
    medioPreferido:
      (donante.persona.medioPredeterminado?.medio as
        | 'EMAIL'
        | 'SMS'
        | 'WHATSAPP') || 'EMAIL',
  };

  const handleAttemptClose = () => {
    if (isDirty) {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedWarning(false);
    setIsDirty(false);
    onClose();
  };

  const handleSubmit = async (data: DonanteFormData) => {
    await onSave(originalEmail, data);
    setIsDirty(false);
    onClose();
  };

  return (
    <>
      <Dialog.Root
        open={isOpen}
        onOpenChange={(e) => {
          if (!e.open) handleAttemptClose();
        }}
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.700" backdropFilter="blur(6px)" />
          <Dialog.Positioner>
            <Dialog.Content
              borderRadius="3xl"
              p="6"
              maxW="3xl"
              w="95%"
              mx="auto"
              maxH="90vh"
              overflowY="auto"
              boxShadow="2xl"
              bg="gray.50"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Dialog.Header pb="4">
                <VStack align="start" gap="1">
                  <Dialog.Title fontSize="2xl" fontWeight="extrabold" color="gray.800">
                    Editar Datos del Donante
                  </Dialog.Title>
                  <Dialog.Description fontSize="sm" color="gray.500">
                    Modifica los campos necesarios y confirma con "Guardar Cambios".
                  </Dialog.Description>
                </VStack>
              </Dialog.Header>

              <Dialog.Body py="2">
                <DonanteForm
                  initialData={initialFormData}
                  isEditMode={true}
                  onSubmit={handleSubmit}
                  onCancel={handleAttemptClose}
                  onChangeDirty={setIsDirty}
                  isLoading={isLoading}
                  submitLabel="Guardar Cambios"
                />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Modal de Advertencia de Cambios No Guardados */}
      <UnsavedChangesModal
        isOpen={showUnsavedWarning}
        onStay={() => setShowUnsavedWarning(false)}
        onDiscard={handleDiscardChanges}
      />
    </>
  );
};

