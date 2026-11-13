import { Box, Button, Heading, HStack, Text } from '@chakra-ui/react';

export function TituloAviso({ asunto, sinLeer, marcarLeido }: {
  asunto: string;
  sinLeer: boolean;
  marcarLeido: () => void;
}) {
  return (
    <HStack justify="space-between" wrap="wrap">
      <HStack gap="2">
        {sinLeer && <Box w="2" h="2" borderRadius="full" bg="blue.500" flexShrink="0">
          <Text srOnly>No leído</Text>
        </Box>}
        <Heading as="h2" size="md">{asunto}</Heading>
      </HStack>
      {sinLeer && (
        <Button variant="ghost" colorPalette="blue" size="sm" onClick={marcarLeido}>
          Marcar como leído
        </Button>
      )}
    </HStack>
  );
}
