import { useEffect, useState, type FormEvent } from 'react';
import {
  Badge,
  Box,
  Button,
  Grid,
  GridItem,
  HStack,
  Input,
  NativeSelect,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import type { DonanteFormData, TipoOrganizacion, TipoPersona } from '../model/types';

interface DonanteFormProps {
  initialData?: Partial<DonanteFormData>;
  onSubmit: (data: DonanteFormData) => void;
  onCancel?: () => void;
  onChangeDirty?: (isDirty: boolean) => void;
  isLoading?: boolean;
  submitLabel?: string;
  isEditMode?: boolean;
}

const DEFAULT_FORM_DATA: DonanteFormData = {
  tipoPersona: 'HUMANA',
  nombre: '',
  apellido: '',
  nroDocumento: '',
  genero: 'Prefiero no decir',
  fechaNacimiento: '',
  razonSocial: '',
  tipoOrganizacion: 'ONG',
  rubro: '',
  representanteNombre: '',
  representanteApellido: '',
  representanteDocumento: '',
  email: '',
  telefono: '',
  calle: '',
  altura: '',
  piso: '',
  depto: '',
  codigoPostal: '',
  medioPreferido: 'EMAIL',
};

export const DonanteForm = ({
  initialData,
  onSubmit,
  onCancel,
  onChangeDirty,
  isLoading = false,
  submitLabel = 'Guardar Donante',
  isEditMode = false,
}: DonanteFormProps) => {
  const [formData, setFormData] = useState<DonanteFormData>(() => ({
    ...DEFAULT_FORM_DATA,
    ...initialData,
  }));

  const [initialSnapshot] = useState<string>(() =>
    JSON.stringify({ ...DEFAULT_FORM_DATA, ...initialData })
  );

  // Detección de formulario sucio (dirty tracking)
  useEffect(() => {
    const isDirty = JSON.stringify(formData) !== initialSnapshot;
    onChangeDirty?.(isDirty);
  }, [formData, initialSnapshot, onChangeDirty]);

  const handleChange = (
    field: keyof DonanteFormData,
    value: string | TipoPersona | TipoOrganizacion
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isHumana = formData.tipoPersona === 'HUMANA';

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%">
      <VStack gap="6" align="stretch">
        {/* Selector de Tipo de Persona (Píldoras redondeadas elegantes) */}
        {!isEditMode && (
          <VStack align="start" gap="2">
            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500" letterSpacing="wider">
              Tipo de Donante
            </Text>
            <HStack
              p="1.5"
              bg="gray.100"
              borderRadius="full"
              width="fit-content"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Button
                type="button"
                size="sm"
                borderRadius="full"
                px="6"
                variant={isHumana ? 'solid' : 'ghost'}
                colorPalette={isHumana ? 'teal' : 'gray'}
                fontWeight={isHumana ? 'bold' : 'medium'}
                onClick={() => handleChange('tipoPersona', 'HUMANA')}
                transition="all 0.2s ease"
              >
                👤 Persona Física
              </Button>
              <Button
                type="button"
                size="sm"
                borderRadius="full"
                px="6"
                variant={!isHumana ? 'solid' : 'ghost'}
                colorPalette={!isHumana ? 'purple' : 'gray'}
                fontWeight={!isHumana ? 'bold' : 'medium'}
                onClick={() => handleChange('tipoPersona', 'JURIDICA')}
                transition="all 0.2s ease"
              >
                🏢 Persona Jurídica
              </Button>
            </HStack>
          </VStack>
        )}

        {isEditMode && (
          <HStack justify="space-between" align="center" pb="2">
            <Text fontSize="sm" color="gray.500">
              Modo de edición para:
            </Text>
            <Badge
              colorPalette={isHumana ? 'teal' : 'purple'}
              variant="subtle"
              px="3"
              py="1"
              borderRadius="full"
              fontSize="xs"
              fontWeight="bold"
            >
              {isHumana ? '👤 Persona Física' : '🏢 Persona Jurídica'}
            </Badge>
          </HStack>
        )}

        {/* Sección: Datos de Identidad */}
        <Box
          p="5"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="2xl"
          bg="white"
          shadow="xs"
        >
          <Text fontSize="sm" fontWeight="bold" color="teal.700" mb="4" textTransform="uppercase" letterSpacing="wide">
            1. Datos de Identidad
          </Text>

          {isHumana ? (
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
              <GridItem>
                <VStack align="start" gap="1.5">
                  <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                    Nombre <Text as="span" color="red.500">*</Text>
                  </Text>
                  <Input
                    placeholder="Ej. Juan Carlos"
                    value={formData.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    required
                    borderRadius="xl"
                    size="md"
                  />
                </VStack>
              </GridItem>

              <GridItem>
                <VStack align="start" gap="1.5">
                  <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                    Apellido <Text as="span" color="red.500">*</Text>
                  </Text>
                  <Input
                    placeholder="Ej. Pérez"
                    value={formData.apellido}
                    onChange={(e) => handleChange('apellido', e.target.value)}
                    required
                    borderRadius="xl"
                    size="md"
                  />
                </VStack>
              </GridItem>

              <GridItem>
                <VStack align="start" gap="1.5">
                  <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                    DNI / Documento <Text as="span" color="red.500">*</Text>
                  </Text>
                  <Input
                    placeholder="Ej. 38456123"
                    value={formData.nroDocumento}
                    onChange={(e) => handleChange('nroDocumento', e.target.value)}
                    required
                    borderRadius="xl"
                    size="md"
                  />
                </VStack>
              </GridItem>

              <GridItem>
                <VStack align="start" gap="1.5">
                  <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                    Género
                  </Text>
                  <NativeSelect.Root size="md" width="100%">
                    <NativeSelect.Field
                      value={formData.genero}
                      onChange={(e) => handleChange('genero', e.target.value)}
                      borderRadius="xl"
                    >
                      <option value="Prefiero no decir">Prefiero no decir</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="No Binario">No Binario</option>
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </VStack>
              </GridItem>

              <GridItem>
                <VStack align="start" gap="1.5">
                  <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                    Fecha de Nacimiento
                  </Text>
                  <Input
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                    borderRadius="xl"
                    size="md"
                  />
                </VStack>
              </GridItem>
            </Grid>
          ) : (
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <VStack align="start" gap="1.5">
                  <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                    Razón Social / Organización <Text as="span" color="red.500">*</Text>
                  </Text>
                  <Input
                    placeholder="Ej. Fundación Manos Solidarias"
                    value={formData.razonSocial}
                    onChange={(e) => handleChange('razonSocial', e.target.value)}
                    required
                    borderRadius="xl"
                    size="md"
                  />
                </VStack>
              </GridItem>

              <GridItem>
                <VStack align="start" gap="1.5">
                  <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                    Tipo de Organización <Text as="span" color="red.500">*</Text>
                  </Text>
                  <NativeSelect.Root size="md" width="100%">
                    <NativeSelect.Field
                      value={formData.tipoOrganizacion}
                      onChange={(e) =>
                        handleChange(
                          'tipoOrganizacion',
                          e.target.value as TipoOrganizacion
                        )
                      }
                      borderRadius="xl"
                    >
                      <option value="ONG">ONG / Sin Fines de Lucro</option>
                      <option value="EMPRESA">Empresa Privada</option>
                      <option value="INSTITUCION">Institución</option>
                      <option value="GUBERNAMENTAL">Gubernamental</option>
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </VStack>
              </GridItem>

              <GridItem>
                <VStack align="start" gap="1.5">
                  <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                    Rubro o Actividad
                  </Text>
                  <Input
                    placeholder="Ej. Alimentos, Salud, Tecnología"
                    value={formData.rubro}
                    onChange={(e) => handleChange('rubro', e.target.value)}
                    borderRadius="xl"
                    size="md"
                  />
                </VStack>
              </GridItem>

              {/* Persona Representante habilitada a operar en su nombre (Consigna TP pág. 11) */}
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <Box
                  p="3"
                  bg="purple.50/50"
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor="purple.100"
                >
                  <Text fontSize="xs" fontWeight="bold" color="purple.700" mb="2">
                    👥 Persona Representante Designada (Opcional)
                  </Text>
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="3">
                    <VStack align="start" gap="1">
                      <Text fontSize="2xs" fontWeight="medium" color="gray.600">
                        Nombre
                      </Text>
                      <Input
                        placeholder="Ej. Martín"
                        value={formData.representanteNombre || ''}
                        onChange={(e) => handleChange('representanteNombre', e.target.value)}
                        borderRadius="lg"
                        size="sm"
                        bg="white"
                      />
                    </VStack>
                    <VStack align="start" gap="1">
                      <Text fontSize="2xs" fontWeight="medium" color="gray.600">
                        Apellido
                      </Text>
                      <Input
                        placeholder="Ej. Gómez"
                        value={formData.representanteApellido || ''}
                        onChange={(e) => handleChange('representanteApellido', e.target.value)}
                        borderRadius="lg"
                        size="sm"
                        bg="white"
                      />
                    </VStack>
                    <VStack align="start" gap="1">
                      <Text fontSize="2xs" fontWeight="medium" color="gray.600">
                        N° Documento
                      </Text>
                      <Input
                        placeholder="Ej. 34567890"
                        value={formData.representanteDocumento || ''}
                        onChange={(e) => handleChange('representanteDocumento', e.target.value)}
                        borderRadius="lg"
                        size="sm"
                        bg="white"
                      />
                    </VStack>
                  </Grid>
                </Box>
              </GridItem>
            </Grid>
          )}
        </Box>

        {/* Sección: Medios de Contacto */}
        <Box
          p="5"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="2xl"
          bg="white"
          shadow="xs"
        >
          <Text fontSize="sm" fontWeight="bold" color="teal.700" mb="4" textTransform="uppercase" letterSpacing="wide">
            2. Medios de Contacto
          </Text>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="4">
            <GridItem colSpan={{ base: 1, md: 2 }}>
              <VStack align="start" gap="1.5">
                <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                  Correo Electrónico <Text as="span" color="red.500">*</Text>
                </Text>
                <Input
                  type="email"
                  placeholder="donante@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  borderRadius="xl"
                  size="md"
                />
              </VStack>
            </GridItem>

            <GridItem>
              <VStack align="start" gap="1.5">
                <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                  Teléfono / Móvil
                </Text>
                <Input
                  type="tel"
                  placeholder="Ej. +54 11 4455-6677"
                  value={formData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  borderRadius="xl"
                  size="md"
                />
              </VStack>
            </GridItem>

            <GridItem colSpan={{ base: 1, md: 3 }}>
              <VStack align="start" gap="1.5">
                <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                  Canal de Contacto Preferido
                </Text>
                <NativeSelect.Root size="md" width="100%">
                  <NativeSelect.Field
                    value={formData.medioPreferido}
                    onChange={(e) =>
                      handleChange(
                        'medioPreferido',
                        e.target.value as 'EMAIL' | 'SMS' | 'WHATSAPP'
                      )
                    }
                    borderRadius="xl"
                  >
                    <option value="EMAIL">✉️ Correo Electrónico (EMAIL)</option>
                    <option value="WHATSAPP">💬 WhatsApp (WHATSAPP)</option>
                    <option value="SMS">📱 Mensaje de Texto (SMS)</option>
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </VStack>
            </GridItem>
          </Grid>
        </Box>

        {/* Sección: Dirección y Ubicación */}
        <Box
          p="5"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="2xl"
          bg="white"
          shadow="xs"
        >
          <Text fontSize="sm" fontWeight="bold" color="teal.700" mb="4" textTransform="uppercase" letterSpacing="wide">
            3. Domicilio (Opcional)
          </Text>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap="4">
            <GridItem colSpan={{ base: 1, md: 3 }}>
              <VStack align="start" gap="1.5">
                <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                  Calle
                </Text>
                <Input
                  placeholder="Ej. Av. Rivadavia"
                  value={formData.calle}
                  onChange={(e) => handleChange('calle', e.target.value)}
                  borderRadius="xl"
                  size="md"
                />
              </VStack>
            </GridItem>

            <GridItem>
              <VStack align="start" gap="1.5">
                <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                  Altura / Número
                </Text>
                <Input
                  type="number"
                  placeholder="1234"
                  value={formData.altura}
                  onChange={(e) => handleChange('altura', e.target.value)}
                  borderRadius="xl"
                  size="md"
                />
              </VStack>
            </GridItem>

            <GridItem>
              <VStack align="start" gap="1.5">
                <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                  Piso
                </Text>
                <Input
                  placeholder="3"
                  value={formData.piso}
                  onChange={(e) => handleChange('piso', e.target.value)}
                  borderRadius="xl"
                  size="md"
                />
              </VStack>
            </GridItem>

            <GridItem>
              <VStack align="start" gap="1.5">
                <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                  Depto
                </Text>
                <Input
                  placeholder="B"
                  value={formData.depto}
                  onChange={(e) => handleChange('depto', e.target.value)}
                  borderRadius="xl"
                  size="md"
                />
              </VStack>
            </GridItem>

            <GridItem colSpan={{ base: 1, md: 2 }}>
              <VStack align="start" gap="1.5">
                <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                  Código Postal
                </Text>
                <Input
                  placeholder="C1033"
                  value={formData.codigoPostal}
                  onChange={(e) => handleChange('codigoPostal', e.target.value)}
                  borderRadius="xl"
                  size="md"
                />
              </VStack>
            </GridItem>
          </Grid>
        </Box>

        {/* Botonera de acciones */}
        <HStack justify="end" gap="3" pt="2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              borderRadius="full"
              px="6"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          )}

          <Button
            type="submit"
            colorPalette="teal"
            borderRadius="full"
            px="8"
            shadow="md"
            disabled={isLoading}
            _hover={{ transform: 'translateY(-1px)', shadow: 'lg' }}
            transition="all 0.2s ease"
          >
            {isLoading ? 'Guardando...' : submitLabel}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

