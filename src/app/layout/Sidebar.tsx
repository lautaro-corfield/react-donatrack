import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Separator,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';

interface SidebarProps {
  onNavigate?: () => void;
}

// Iconos SVG integrados y limpios para cada opción de menú
const DonantesIcon = () => (
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
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const DonacionesIcon = () => (
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
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

const EntidadesIcon = () => (
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
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
);

const SupervisoresIcon = () => (
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
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <circle cx="12" cy="10" r="3" />
    <path d="M7 18a5 5 0 0 1 10 0" />
  </svg>
);

const LogoutIcon = () => (
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
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const HeartHandshakeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
    <path d="M10 21h4" />
  </svg>
);

const MedalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="5" />
    <path d="m8 12-2 9 6-3 6 3-2-9" />
  </svg>
);

interface NavItem {
  label: string;
  path: string;
  icon: () => React.JSX.Element;
  requiredRole?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Donantes', path: '/dashboard/donantes', icon: DonantesIcon },
  { label: 'Donaciones', path: '/dashboard/donaciones', icon: DonacionesIcon },
  { label: 'Entidades beneficiarias', path: '/dashboard/entidades', icon: EntidadesIcon },
  {
    label: 'Supervisores',
    path: '/dashboard/supervisores',
    icon: SupervisoresIcon,
    requiredRole: 'ADMIN',
  },
  { label: 'Administradores de Logística', path: '/dashboard/administradores-logistica', icon: SupervisoresIcon, requiredRole: 'ADMIN' },
];

const ENTIDAD_NAV_ITEMS: NavItem[] = [
  { label: 'Mis necesidades', path: '/dashboard/necesidades', icon: EntidadesIcon },
  { label: 'Donaciones recibidas', path: '/dashboard/donaciones-recibidas', icon: DonacionesIcon },
  { label: 'Avisos', path: '/dashboard/avisos', icon: BellIcon },
];

const DONANTE_NAV_ITEMS: NavItem[] = [
  { label: 'Mi actividad', path: '/dashboard/mi-actividad', icon: DonantesIcon },
  { label: 'Mis donaciones', path: '/dashboard/mis-donaciones', icon: DonacionesIcon },
  { label: 'Misiones e Insignias', path: '/dashboard/misiones-e-insignias', icon: MedalIcon },
  { label: 'Mis avisos', path: '/dashboard/mis-avisos', icon: BellIcon },
];

/**
 * Menú lateral de navegación para el Dashboard de DonaTrack.
 * Soporta indicación visual de ruta activa, filtrado por rol ADMIN y cierre de sesión seguro.
 */
export const Sidebar = ({ onNavigate }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  // Verificación estricta del rol ADMIN desde el store de Zustand
  const isAdmin =
    user?.role === 'ADMIN' ||
    user?.roles?.includes('ADMIN') ||
    user?.roles?.includes('ROLE_ADMIN');

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleItemClick = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const handleLogout = () => {
    const loginPath = user?.role && ['ADMIN', 'SUPERVISOR', 'ADMIN_LOGISTICA'].includes(user.role) ? '/login/admin' : '/login';
    logout();
    navigate(loginPath);
    onNavigate?.();
  };

  // Filtrado de pestañas según permisos
  const visibleNavItems = user?.role === 'ADMIN_LOGISTICA'
    ? [{ label: 'Logística', path: '/dashboard/logistica', icon: DonacionesIcon }]
    : user?.role === 'DONANTE' ? DONANTE_NAV_ITEMS : user?.role === 'ENTIDAD_BENEFICIARIA' ? ENTIDAD_NAV_ITEMS : NAV_ITEMS.filter((item) => {
    if (item.requiredRole === 'ADMIN') {
      return isAdmin;
    }
    return true;
  });

  return (
    <Flex
      direction="column"
      h="100%"
      w="100%"
      bg="white"
      p="5"
      justify="space-between"
    >
      {/* Sección Superior: Brand + Perfil + Navegación */}
      <VStack gap="6" align="stretch">
        {/* Cabecera / Marca */}
        <HStack gap="3" align="center">
          <Box
            p="2"
            borderRadius="lg"
            bg="teal.600"
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <HeartHandshakeIcon />
          </Box>
          <VStack align="start" gap="0">
            <Heading size="md" color="teal.800" fontWeight="extrabold">
              DonaTrack
            </Heading>
            <Text fontSize="2xs" color="gray.500" textTransform="uppercase" letterSpacing="wide">
              Gestión de Donaciones
            </Text>
          </VStack>
        </HStack>

        <Separator />

        {/* Resumen de Usuario Activo */}
        {user && (
          <Box
            p="3"
            bg="gray.50"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.100"
          >
            <HStack gap="3" align="center">
              <Avatar.Root size="sm">
                <Avatar.Fallback name={user.name || 'Usuario'} />
                {user.picture && <Avatar.Image src={user.picture} alt={user.name} />}
              </Avatar.Root>
              <VStack align="start" gap="0" overflow="hidden" flex="1">
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="gray.800"
                  truncate
                  width="100%"
                >
                  {user.name || 'Usuario'}
                </Text>
                <Text fontSize="2xs" color="gray.500" truncate width="100%">
                  {user.email}
                </Text>
              </VStack>
              {user.role && (
                <Badge
                  colorPalette={isAdmin ? 'purple' : 'teal'}
                  variant="subtle"
                  size="xs"
                >
                  {user.role}
                </Badge>
              )}
            </HStack>
          </Box>
        )}

        {/* Lista de Navegación */}
        <VStack gap="2" align="stretch">
          <Text
            fontSize="xs"
            fontWeight="bold"
            color="gray.400"
            textTransform="uppercase"
            letterSpacing="wider"
            px="2"
          >
            Menú Principal
          </Text>

          {visibleNavItems.map((item) => {
            const active = isActive(item.path);
            const IconComponent = item.icon;
            const isSpecial = item.requiredRole === 'ADMIN';

            return (
              <Button
                key={item.path}
                variant={active ? 'solid' : 'ghost'}
                colorPalette={isSpecial ? 'purple' : active ? 'teal' : 'gray'}
                justifyContent="flex-start"
                size="md"
                borderRadius="xl"
                onClick={() => handleItemClick(item.path)}
                px="3.5"
                py="2.5"
                gap="3"
                fontWeight={active ? 'bold' : 'medium'}
                bg={
                  active
                    ? isSpecial
                      ? 'purple.600'
                      : 'teal.600'
                    : 'transparent'
                }
                color={active ? 'white' : 'gray.700'}
                _hover={{
                  bg: active
                    ? isSpecial
                      ? 'purple.700'
                      : 'teal.700'
                    : 'gray.100',
                  color: active ? 'white' : 'gray.900',
                }}
                transition="all 0.2s ease"
              >
                <IconComponent />
                <Text fontSize="sm">{item.label}</Text>
                {isSpecial && !active && (
                  <Badge colorPalette="purple" variant="subtle" size="xs" ml="auto">
                    Admin
                  </Badge>
                )}
              </Button>
            );
          })}
        </VStack>
      </VStack>

      {/* Sección Inferior: Botón de Cerrar Sesión */}
      <VStack gap="3" align="stretch" pt="4">
        <Separator />
        <Button
          variant="ghost"
          colorPalette="red"
          color="red.600"
          justifyContent="flex-start"
          size="md"
          borderRadius="xl"
          onClick={handleLogout}
          px="3.5"
          py="2.5"
          gap="3"
          _hover={{
            bg: 'red.50',
            color: 'red.700',
          }}
          transition="all 0.2s ease"
          width="100%"
        >
          <LogoutIcon />
          <Text fontSize="sm" fontWeight="semibold">
            Cerrar Sesión
          </Text>
        </Button>
      </VStack>
    </Flex>
  );
};
