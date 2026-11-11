import {
  Toaster as ChakraToaster,
  Portal,
  Stack,
  Toast,
} from '@chakra-ui/react';
import { toaster } from './toaster.instance';

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster
        toaster={toaster}
        insetInline={{ base: '16px', md: '28px' }}
        insetBlock={{ base: '16px', md: '28px' }}
      >
        {(toast) => (
          <Toast.Root
            key={toast.id}
            width={{ base: 'calc(100vw - 32px)', sm: '380px' }}
            maxW="420px"
            p="4"
            borderRadius="2xl"
            shadow="2xl"
            borderWidth="1px"
            borderColor="blackAlpha.100"
            display="flex"
            alignItems="flex-start"
            gap="3"
          >
            <Toast.Indicator mt="0.5" />
            <Stack gap="1" flex="1" maxWidth="100%">
              {toast.title && (
                <Toast.Title fontWeight="bold" fontSize="sm" color="inherit">
                  {toast.title}
                </Toast.Title>
              )}
              {toast.description && (
                <Toast.Description
                  fontSize="xs"
                  opacity={0.92}
                  lineHeight="relaxed"
                  color="inherit"
                >
                  {toast.description}
                </Toast.Description>
              )}
            </Stack>
            <Toast.CloseTrigger />
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  );
};
