import { Box, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  action?: ReactNode;
}

/**
 * Componente atómico compartido para cabeceras de página.
 * Agnóstico a las features del negocio (Shared UI).
 */
export const PageHeader = ({ title, subtitle, badge, action }: PageHeaderProps) => {
  return (
    <HStack justify="space-between" align="center" wrap="wrap" gap="4" w="100%">
      <VStack align="start" gap="1">
        <HStack gap="3" align="center">
          <Heading as="h1" size="2xl" color="gray.800" fontWeight="bold">
            {title}
          </Heading>
          {badge && <Box>{badge}</Box>}
        </HStack>
        {subtitle && (
          <Text fontSize="sm" color="gray.500">
            {subtitle}
          </Text>
        )}
      </VStack>
      {action && <Box>{action}</Box>}
    </HStack>
  );
};
