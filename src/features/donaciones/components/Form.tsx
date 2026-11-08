import { useState, type FormEvent } from 'react';
import {
  Box,
  Button,
  Card,
  HStack,
  Input,
  NativeSelect,
  Stack,
  Text,
} from '@chakra-ui/react';
import type {
  CategoriaDonacion,
  CreateDonacionDTO,
  EstadoDonacion,
} from '../model/types';

export interface DonacionFormProps {
  initialData?: Partial<CreateDonacionDTO>;
  onSubmit: (data: CreateDonacionDTO) => Promise<void> | void;
  isLoading?: boolean;
  onCancel?: () => void;
}

const CATEGORIAS: CategoriaDonacion[] = [
  'ALIMENTOS',
  'MEDICAMENTOS',
  'ROPA',
  'DINERO',
  'JUGUETES',
  'OTROS',
];

const ESTADOS: EstadoDonacion[] = [
  'PENDIENTE',
  'RECIBIDA',
  'EN_TRANSITO',
  'ENTREGADA',
  'CANCELADA',
];

/**
 * Componente de formulario de Donaciones.
 * Es un componente puramente presentacional ("dumb component"):
 * recibe datos iniciales y la acción onSubmit por props para permitir
 * su reutilización tanto en Create como en Edit.
 */
export const DonacionForm = ({
  initialData,
  onSubmit,
  isLoading = false,
  onCancel,
}: DonacionFormProps) => {
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || '');
  const [categoria, setCategoria] = useState<CategoriaDonacion>(
    initialData?.categoria || 'ALIMENTOS'
  );
  const [cantidad, setCantidad] = useState(
    initialData?.cantidad ? String(initialData.cantidad) : ''
  );
  const [unidadMedida, setUnidadMedida] = useState(
    initialData?.unidadMedida || 'unidades'
  );
  const [estado, setEstado] = useState<EstadoDonacion>(
    initialData?.estado || 'PENDIENTE'
  );
  const [donanteNombre, setDonanteNombre] = useState(
    initialData?.donanteNombre || ''
  );
  const [entidadDestino, setEntidadDestino] = useState(
    initialData?.entidadDestino || ''
  );
  const [observaciones, setObservaciones] = useState(
    initialData?.observaciones || ''
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit({
      descripcion,
      categoria,
      cantidad: Number(cantidad) || 0,
      unidadMedida,
      estado,
      donanteNombre,
      entidadDestino,
      observaciones: observaciones.trim() ? observaciones : undefined,
    });
  };

  return (
    <Card.Root borderWidth="1px" borderRadius="2xl" shadow="sm" p="6" bg="white">
      <form onSubmit={handleSubmit}>
        <Stack gap="5">
          {/* Descripción */}
          <Box>
            <Text fontSize="xs" fontWeight="bold" color="gray.600" mb="1">
              Descripción de la donación *
            </Text>
            <Input
              type="text"
              placeholder="Ej. Cajas de leche en polvo y conservas"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              disabled={isLoading}
              borderRadius="md"
            />
          </Box>

          {/* Categoría y Estado */}
          <HStack gap="4" align="start" wrap={{ base: 'wrap', md: 'nowrap' }}>
            <Box flex="1" minW="200px">
              <Text fontSize="xs" fontWeight="bold" color="gray.600" mb="1">
                Categoría *
              </Text>
              <NativeSelect.Root disabled={isLoading}>
                <NativeSelect.Field
                  value={categoria}
                  onChange={(e) =>
                    setCategoria(e.target.value as CategoriaDonacion)
                  }
                  borderRadius="md"
                >
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Box>

            <Box flex="1" minW="200px">
              <Text fontSize="xs" fontWeight="bold" color="gray.600" mb="1">
                Estado *
              </Text>
              <NativeSelect.Root disabled={isLoading}>
                <NativeSelect.Field
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as EstadoDonacion)}
                  borderRadius="md"
                >
                  {ESTADOS.map((est) => (
                    <option key={est} value={est}>
                      {est}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Box>
          </HStack>

          {/* Cantidad y Unidad de Medida */}
          <HStack gap="4" align="start" wrap={{ base: 'wrap', md: 'nowrap' }}>
            <Box flex="1" minW="150px">
              <Text fontSize="xs" fontWeight="bold" color="gray.600" mb="1">
                Cantidad *
              </Text>
              <Input
                type="number"
                min="0.01"
                step="any"
                placeholder="Ej. 150"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                required
                disabled={isLoading}
                borderRadius="md"
              />
            </Box>

            <Box flex="1" minW="150px">
              <Text fontSize="xs" fontWeight="bold" color="gray.600" mb="1">
                Unidad de medida *
              </Text>
              <Input
                type="text"
                placeholder="Ej. kg, unidades, cajas, ARS"
                value={unidadMedida}
                onChange={(e) => setUnidadMedida(e.target.value)}
                required
                disabled={isLoading}
                borderRadius="md"
              />
            </Box>
          </HStack>

          {/* Donante y Entidad Destino */}
          <HStack gap="4" align="start" wrap={{ base: 'wrap', md: 'nowrap' }}>
            <Box flex="1" minW="200px">
              <Text fontSize="xs" fontWeight="bold" color="gray.600" mb="1">
                Nombre del Donante *
              </Text>
              <Input
                type="text"
                placeholder="Ej. Supermercado Mayorista Norte"
                value={donanteNombre}
                onChange={(e) => setDonanteNombre(e.target.value)}
                required
                disabled={isLoading}
                borderRadius="md"
              />
            </Box>

            <Box flex="1" minW="200px">
              <Text fontSize="xs" fontWeight="bold" color="gray.600" mb="1">
                Entidad Beneficiaria Destino *
              </Text>
              <Input
                type="text"
                placeholder="Ej. Comedor Santa Teresita"
                value={entidadDestino}
                onChange={(e) => setEntidadDestino(e.target.value)}
                required
                disabled={isLoading}
                borderRadius="md"
              />
            </Box>
          </HStack>

          {/* Observaciones */}
          <Box>
            <Text fontSize="xs" fontWeight="bold" color="gray.600" mb="1">
              Observaciones adicionales
            </Text>
            <Input
              type="text"
              placeholder="Instrucciones especiales de almacenamiento o entrega"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              disabled={isLoading}
              borderRadius="md"
            />
          </Box>

          {/* Acciones */}
          <HStack justify="flex-end" gap="3" pt="4">
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
              disabled={isLoading}
              borderRadius="lg"
              px="6"
            >
              {isLoading ? 'Guardando...' : 'Guardar Donación'}
            </Button>
          </HStack>
        </Stack>
      </form>
    </Card.Root>
  );
};
