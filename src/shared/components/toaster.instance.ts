import { createToaster } from '@chakra-ui/react';

/**
 * Instancia del sistema de notificaciones (Toaster) para Chakra UI v3.
 * Proporciona métodos imperativos: toaster.create, toaster.success, toaster.error.
 */
export const toaster = createToaster({
  placement: 'top-end',
  pauseOnPageIdle: true,
  offsets: {
    top: '24px',
    right: '24px',
    bottom: '24px',
    left: '24px',
  },
});
