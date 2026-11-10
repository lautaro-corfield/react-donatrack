import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  HStack,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { toaster } from '@/shared/components/toaster.instance';
import { CsvImportCard } from '../components/CsvImportCard';
import { DonanteForm } from '../components/DonanteForm';
import { useDonantesStore } from '../model/donantesStore';
import type {
  ContactoValor,
  CrearPersonaHumanaDTO,
  CrearPersonaJuridicaDTO,
  DonanteFormData,
} from '../model/types';

export const DonantesCreateView = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'MANUAL' | 'CSV'>('MANUAL');
  const [isLoading, setIsLoading] = useState(false);

  const createHumano = useDonantesStore((state) => state.createHumano);
  const createJuridico = useDonantesStore((state) => state.createJuridico);

  const handleManualSubmit = async (formData: DonanteFormData) => {
    setIsLoading(true);
    try {
      const direccion =
        formData.calle.trim() || formData.altura.trim()
          ? {
              calle: formData.calle.trim(),
              calle1: formData.calle.trim(),
              altura: Number(formData.altura) || 0,
              piso: formData.piso ? Number(formData.piso) || 0 : undefined,
              depto: formData.depto.trim() || undefined,
              departamento: formData.depto.trim() || undefined,
              codigoPostal: formData.codigoPostal.trim() || undefined,
            }
          : undefined;

      const telefonoMedio =
        formData.medioPreferido === 'WHATSAPP' ? ('WHATSAPP' as const) : ('SMS' as const);

      const mediosDeContacto: ContactoValor[] = [
        ...(formData.email
          ? [{ medio: 'EMAIL' as const, valor: formData.email }]
          : []),
        ...(formData.telefono
          ? [{ medio: telefonoMedio, valor: formData.telefono }]
          : []),
      ];

      const medioPredeterminado = {
        medio: formData.medioPreferido,
        valor:
          formData.medioPreferido === 'EMAIL'
            ? formData.email
            : formData.telefono || formData.email,
      };

      let result;
      if (formData.tipoPersona === 'HUMANA') {
        const dto: CrearPersonaHumanaDTO = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          nroDocumento: formData.nroDocumento,
          genero: formData.genero,
          fechaNacimiento: formData.fechaNacimiento,
          direccion,
          mediosDeContacto,
          medioPredeterminado,
        };
        result = await createHumano(dto);
      } else {
        const representantes =
          formData.representanteNombre && formData.representanteApellido
            ? [
                {
                  nombre: formData.representanteNombre,
                  apellido: formData.representanteApellido,
                  nroDocumento: Number(formData.representanteDocumento) || 0,
                },
              ]
            : undefined;

        const dto: CrearPersonaJuridicaDTO = {
          razonSocial: formData.razonSocial,
          tipo: formData.tipoOrganizacion,
          rubro: formData.rubro,
          representantes,
          direccion,
          mediosDeContacto,
          medioPredeterminado,
        };
        result = await createJuridico(dto);
      }

      if (result?.isUpdated) {
        toaster.create({
          title: 'Donante existente actualizado',
          description:
            'El correo electrónico ya se encontraba registrado en DonaTrack. Sus datos fueron actualizados conforme a la consigna del sistema.',
          type: 'info',
        });
      } else {
        toaster.create({
          title: 'Donante registrado',
          description: 'El nuevo donante ha sido registrado exitosamente en DonaTrack.',
          type: 'success',
        });
      }

      navigate('/dashboard/donantes/lista');
    } catch {
      toaster.create({
        title: 'Error al registrar',
        description: 'No se pudo completar el registro del donante.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack gap="6" align="stretch" maxW="4xl" mx="auto" py="4">
      {/* Botón de Retorno con Píldora Suave */}
      <HStack justify="space-between" align="center">
        <Button
          variant="outline"
          borderRadius="full"
          size="sm"
          px="5"
          onClick={() => navigate('/dashboard/donantes')}
          _hover={{ transform: 'translateX(-3px)', bg: 'gray.100' }}
          transition="all 0.2s ease"
        >
          ← Volver al Menú de Donantes
        </Button>

        <Badge colorPalette="teal" variant="subtle" borderRadius="full" px="3" py="1">
          Paso: Registro
        </Badge>
      </HStack>

      {/* Encabezado */}
      <PageHeader
        title="Registrar Nuevo Donante"
        subtitle="Elige la modalidad de carga que prefieras: formulario manual o importación masiva mediante archivo."
      />

      {/* Selector de Modalidad (Píldoras Superiores) */}
      <HStack
        p="1.5"
        bg="gray.100"
        borderRadius="full"
        width="fit-content"
        mx="auto"
        borderWidth="1px"
        borderColor="gray.200"
        shadow="xs"
      >
        <Button
          size="md"
          borderRadius="full"
          px="7"
          variant={activeTab === 'MANUAL' ? 'solid' : 'ghost'}
          colorPalette={activeTab === 'MANUAL' ? 'teal' : 'gray'}
          fontWeight={activeTab === 'MANUAL' ? 'bold' : 'medium'}
          onClick={() => setActiveTab('MANUAL')}
          transition="all 0.2s ease"
        >
          ✍️ Carga Manual
        </Button>

        <Button
          size="md"
          borderRadius="full"
          px="7"
          variant={activeTab === 'CSV' ? 'solid' : 'ghost'}
          colorPalette={activeTab === 'CSV' ? 'teal' : 'gray'}
          fontWeight={activeTab === 'CSV' ? 'bold' : 'medium'}
          onClick={() => setActiveTab('CSV')}
          transition="all 0.2s ease"
        >
          📂 Carga por CSV o Excel
        </Button>
      </HStack>

      {/* Contenedor del Formulario o Importador */}
      <Card.Root
        borderRadius="3xl"
        borderWidth="1px"
        borderColor="gray.200"
        shadow="lg"
        bg="white"
        p={{ base: 6, md: 8 }}
      >
        {activeTab === 'MANUAL' ? (
          <DonanteForm
            onSubmit={handleManualSubmit}
            onCancel={() => navigate('/dashboard/donantes')}
            isLoading={isLoading}
            submitLabel="Completar y Registrar Donante"
          />
        ) : (
          <CsvImportCard />
        )}
      </Card.Root>
    </VStack>
  );
};

