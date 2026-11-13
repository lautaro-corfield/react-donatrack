import { useEffect, useState } from 'react';
import { Box, Drawer, Flex, HStack, Heading, IconButton } from '@chakra-ui/react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';
import { donantesApi } from '@/features/donantes/api/donantesApi';
import { entidadesApi } from '@/features/entidades/api/entidadesApi';
import { useLecturaAvisos } from '@/features/avisos/lectura';
import { Sidebar } from './Sidebar';

const MenuIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

/**
 * Layout principal del Dashboard de DonaTrack.
 * - Ocupa el 100% del alto y ancho de la pantalla (100vh, 100vw).
 * - En Desktop: Sidebar fijo a la izquierda (280px) y Main Content con <Outlet /> a la derecha.
 * - En Mobile: Topbar con botón hamburguesa y menú deslizable en un Drawer de Chakra UI v3.
 */
export const DashboardLayout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const user = useAuthStore(state => state.user);
  const { pathname } = useLocation();
  const [avisos, setAvisos] = useState<{ cuenta: typeof user; ids: (string | number)[] }>();
  const { sinLeer } = useLecturaAvisos();
  const hayAvisosSinLeer = avisos?.cuenta === user && avisos.ids.some(sinLeer);

  useEffect(() => {
    const cargar = user?.role === 'DONANTE' ? donantesApi.avisos :
      user?.role === 'ENTIDAD_BENEFICIARIA' ? entidadesApi.avisos : null;
    if (!cargar) return;
    const controlador = new AbortController();
    const actualizar = () => {
      void cargar(controlador.signal).then(datos => {
        if (!controlador.signal.aborted) setAvisos({ cuenta: user, ids: datos.map(aviso => aviso.id) });
      }).catch(() => {});
    };
    actualizar();
    window.addEventListener('focus', actualizar);
    const intervalo = window.setInterval(actualizar, 30_000);
    return () => {
      controlador.abort();
      window.removeEventListener('focus', actualizar);
      window.clearInterval(intervalo);
    };
  }, [user, pathname]);

  return (
    <Flex h="100vh" w="100vw" overflow="hidden" direction="column" bg="gray.50">
      {/* Barra superior exclusiva para dispositivos móviles */}
      <HStack
        display={{ base: 'flex', md: 'none' }}
        h="16"
        px="4"
        bg="white"
        borderBottomWidth="1px"
        borderColor="gray.200"
        justify="space-between"
        align="center"
        flexShrink="0"
        zIndex="docked"
      >
        <HStack gap="3">
          <IconButton
            aria-label="Abrir menú de navegación"
            variant="ghost"
            size="md"
            onClick={() => setIsDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Heading size="md" color="teal.800" fontWeight="bold">
            DonaTrack
          </Heading>
        </HStack>
      </HStack>

      {/* Drawer deslizable para navegación móvil */}
      <Drawer.Root
        open={isDrawerOpen}
        onOpenChange={(e) => setIsDrawerOpen(e.open)}
        placement="start"
      >
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content maxW="280px" p="0" bg="white">
            <Sidebar hayAvisosSinLeer={hayAvisosSinLeer} onNavigate={() => setIsDrawerOpen(false)} />
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>

      {/* Contenedor Principal: Sidebar Desktop + Contenido Dinámico */}
      <Flex flex="1" overflow="hidden" w="100%">
        {/* Menú lateral fijo para escritorio */}
        <Box
          display={{ base: 'none', md: 'block' }}
          w="280px"
          h="100%"
          borderRightWidth="1px"
          borderColor="gray.200"
          bg="white"
          flexShrink="0"
        >
          <Sidebar hayAvisosSinLeer={hayAvisosSinLeer} />
        </Box>

        {/* Área de contenido dinámico donde se renderizan las vistas hijas */}
        <Box
          as="main"
          flex="1"
          h="100%"
          overflowY="auto"
          p={{ base: '4', md: '8' }}
          bg="gray.50"
        >
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
};
