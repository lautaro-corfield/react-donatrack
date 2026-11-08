import { useState, type FormEvent } from 'react';
import {
  Box,
  Button,
  Card,
  HStack,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import type { CreateSupervisorDTO } from '../model/supervisores.types';

export interface SupervisorFormProps {
  onSubmit: (data: CreateSupervisorDTO) => Promise<void> | void;
  isLoading?: boolean;
  onCancel?: () => void;
}

/**
 * Componente de formulario atómico para alta de Supervisores.
 * Presentacional ("dumb component"): maneja el input local de email
 * y delega el submit mediante la prop onSubmit.
 */
export const SupervisorForm = ({
  onSubmit,
  isLoading = false,
  onCancel,
}: SupervisorFormProps) => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    await onSubmit({ email: email.trim() });
  };

  return (
    <Card.Root borderWidth="1px" borderRadius="2xl" shadow="sm" p="6" bg="white">
      <form onSubmit={handleSubmit}>
        <Stack gap="5">
          <Box>
            <Text fontSize="xs" fontWeight="bold" color="gray.600" mb="1.5">
              Dirección de correo electrónico *
            </Text>
            <Input
              type="email"
              placeholder="supervisor@donatrack.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              size="md"
              borderRadius="md"
            />
            <Text fontSize="2xs" color="gray.400" mt="1.5">
              Se enviará una invitación a este correo para que el supervisor configure sus credenciales de acceso.
            </Text>
          </Box>

          <HStack justify="flex-end" gap="3" pt="2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                colorPalette="gray"
                onClick={onCancel}
                disabled={isLoading}
                borderRadius="lg"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              colorPalette="teal"
              disabled={isLoading || !email.trim()}
              borderRadius="lg"
              px="6"
            >
              {isLoading ? 'Registrando...' : 'Habilitar Supervisor'}
            </Button>
          </HStack>
        </Stack>
      </form>
    </Card.Root>
  );
};
