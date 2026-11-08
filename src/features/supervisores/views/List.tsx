import { useEffect } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  HStack,
  Spinner,
  Table,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { useSupervisoresStore } from '../model/supervisoresStore';

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

const UserCheckIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <polyline points="16 11 18 13 22 9" />
  </svg>
);

/**
 * Vista principal de listado de Supervisores (List.tsx).
 */
export const SupervisoresListView = () => {
  const navigate = useNavigate();
  const supervisores = useSupervisoresStore((state) => state.supervisores);
  const isLoading = useSupervisoresStore((state) => state.isLoading);
  const fetchSupervisores = useSupervisoresStore((state) => state.fetchSupervisores);

  useEffect(() => {
    fetchSupervisores();
  }, [fetchSupervisores]);

  return (
    <VStack gap="6" align="stretch" maxW="5xl" mx="auto">
      <PageHeader
        title="Supervisores"
        subtitle="Gestión y control de accesos operativos de supervisión para DonaTrack."
        badge={
          <Badge colorPalette="purple" variant="subtle" px="2.5" py="1" borderRadius="full">
            {supervisores.length} habilitados
          </Badge>
        }
        action={
          <Button
            colorPalette="teal"
            borderRadius="xl"
            gap="2"
            onClick={() => navigate('/dashboard/supervisores/nuevo')}
          >
            <PlusIcon />
            <Text>Habilitar Supervisor</Text>
          </Button>
        }
      />

      <Card.Root borderWidth="1px" borderRadius="2xl" shadow="sm" bg="white" overflow="hidden">
        <Box overflowX="auto">
          {isLoading && supervisores.length === 0 ? (
            <VStack py="12" justify="center" align="center" gap="3">
              <Spinner size="md" colorPalette="teal" />
              <Text fontSize="sm" color="gray.500">
                Consultando supervisores habilitados...
              </Text>
            </VStack>
          ) : (
            <Table.Root size="md" variant="line">
              <Table.Header bg="gray.50">
                <Table.Row>
                  <Table.ColumnHeader color="gray.600">Correo Electrónico</Table.ColumnHeader>
                  <Table.ColumnHeader color="gray.600">Estado</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {supervisores.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={4} textAlign="center" py="10" color="gray.500">
                      No hay supervisores registrados. Haz clic en "Habilitar Supervisor" para otorgar el primer acceso.
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  supervisores.map((sup) => (
                    <Table.Row key={sup.id} _hover={{ bg: 'gray.50' }} transition="all 0.15s">
                      <Table.Cell>
                        <HStack gap="3">
                          <Box p="1.5" bg="purple.50" color="purple.600" borderRadius="md">
                            <UserCheckIcon />
                          </Box>
                          <Text fontWeight="medium" color="gray.800">
                            {sup.email}
                          </Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette="green" variant="solid" size="xs" borderRadius="full" px="2">
                          Habilitado
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Root>
          )}
        </Box>
      </Card.Root>
    </VStack>
  );
};
