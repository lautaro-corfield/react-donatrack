import { useEffect, useState } from 'react';
import { Badge, Card, SimpleGrid, Skeleton, Text, VStack } from '@chakra-ui/react';
import { publicoApi } from '../api/publicoApi';
import { descripcionDonacion, fechaCorta, nombreCategoria } from '../model/format';
import type { DonacionPublica } from '../model/types';

/** Tarjetas con las donaciones entregadas en los últimos 30 días. */
export const DonacionesDestacadas = () => {
  const [destacadas, setDestacadas] = useState<DonacionPublica[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    publicoApi
      .destacadas(6)
      .then(setDestacadas)
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="4" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} h="128px" borderRadius="xl" />
        ))}
      </SimpleGrid>
    );
  }

  if (error) {
    return (
      <Text color="gray.600" role="alert">
        No pudimos cargar las donaciones destacadas en este momento.
      </Text>
    );
  }

  if (!destacadas.length) {
    return (
      <Text color="gray.600">
        Este mes todavía no hubo entregas. ¡Tu donación puede ser la primera!
      </Text>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="4">
      {destacadas.map((d) => (
        <Card.Root key={d.id} borderRadius="xl" borderWidth="1px">
          <Card.Body>
            <VStack align="start" gap="2">
              <Badge colorPalette="teal" variant="subtle">
                {nombreCategoria(d.categoria)}
              </Badge>
              <Text fontWeight="semibold" color="gray.800">
                {descripcionDonacion(d)}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Para {d.entidad ?? 'una entidad beneficiaria'}
              </Text>
              <Text fontSize="xs" color="gray.500">
                Entregada el {fechaCorta(d.fechaEntrega)}
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>
      ))}
    </SimpleGrid>
  );
};
