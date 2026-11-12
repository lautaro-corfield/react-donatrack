import { useState } from 'react';
import { Card, Heading, Image, Stack, Tabs, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { LoginForm } from './LoginForm';

type PublicRole = 'DONANTE' | 'ENTIDAD_BENEFICIARIA';

function RoleIcon({ role }: { role: PublicRole }) {
  return role === 'DONANTE' ? (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" />
    </svg>
  ) : (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M3 21h18M9 21v-5h6v5M8 7h2m4 0h2M8 11h2m4 0h2" />
    </svg>
  );
}

export const LoginCard = ({ staff = false }: { staff?: boolean }) => {
  const location = useLocation();
  const initialRole = (location.state as { role?: string } | null)?.role;
  const [role, setRole] = useState<PublicRole>(initialRole === 'ENTIDAD_BENEFICIARIA' ? initialRole : 'DONANTE');
  return (
    <Card.Root
      maxW="md"
      w="100%"
      borderWidth="1px"
      borderRadius="2xl"
      shadow="xl"
      p="2"
    >
      <Card.Header textAlign="center" pt="6" pb="2">
        <VStack gap="3">
          <Image
            src="/donatrack.jpeg"
            alt="Logo DonaTrack"
            boxSize="84px"
            objectFit="contain"
            borderRadius="2xl"
            shadow="sm"
          />
          <Heading as="h1" size="2xl" fontWeight="extrabold" colorPalette="teal">
            DonaTrack
          </Heading>
          <Card.Title fontSize="lg" fontWeight="semibold" color="gray.700">
            {staff ? 'Ingreso del equipo' : 'Iniciar sesión'}
          </Card.Title>
        </VStack>
      </Card.Header>

      <Card.Body py="6">
        {staff ? <LoginForm allowedRoles={['ADMIN', 'SUPERVISOR']} /> : (
          <Tabs.Root value={role} onValueChange={({ value }) => setRole(value as PublicRole)} fitted variant="plain" colorPalette="teal" w="100%">
            <Tabs.List bg="gray.100" borderWidth="1px" borderColor="gray.200" borderRadius="full" p="1" mb="6" w="100%">
              <Tabs.Trigger value="DONANTE" borderRadius="full" justifyContent="center" gap="2" _selected={{ bg: 'teal.600', color: 'white', shadow: 'sm' }}>
                <RoleIcon role="DONANTE" /> Donantes
              </Tabs.Trigger>
              <Tabs.Trigger value="ENTIDAD_BENEFICIARIA" borderRadius="full" justifyContent="center" gap="2" _selected={{ bg: 'teal.600', color: 'white', shadow: 'sm' }}>
                <RoleIcon role="ENTIDAD_BENEFICIARIA" /> Entidades
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="DONANTE"><LoginForm allowedRoles={['DONANTE']} /></Tabs.Content>
            <Tabs.Content value="ENTIDAD_BENEFICIARIA"><LoginForm allowedRoles={['ENTIDAD_BENEFICIARIA']} /></Tabs.Content>
            <Stack align="center" mt="6">
              <Text fontSize="sm" color="gray.600">¿No tenés cuenta? <RouterLink to={role === 'DONANTE' ? '/registro/donante' : '/registro/entidad'} style={{ color: 'var(--chakra-colors-teal-700)', fontWeight: 700 }}>Registrate</RouterLink></Text>
            </Stack>
          </Tabs.Root>
        )}
      </Card.Body>

      <Card.Footer justifyContent="center" pb="6">
        <RouterLink to="/" style={{ color: 'var(--chakra-colors-gray-600)', fontSize: '0.875rem' }}>
          ← Volver al inicio
        </RouterLink>
      </Card.Footer>
    </Card.Root>
  );
};
