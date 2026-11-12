import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

interface Apartado {
  titulo: string;
  texto: string;
}

const CONTENIDO: Record<'legal' | 'privacidad', { titulo: string; apartados: Apartado[] }> = {
  legal: {
    titulo: 'Información legal',
    apartados: [
      {
        titulo: 'Sobre DonaTrack',
        texto:
          'DonaTrack es una plataforma desarrollada en el marco del Trabajo Práctico Anual de Diseño de Sistemas (UTN) para gestionar donaciones materiales entre personas donantes y entidades beneficiarias.',
      },
      {
        titulo: 'Uso de la plataforma',
        texto:
          'Al registrarte aceptás usar DonaTrack de buena fe, cargar información verdadera y no utilizarla con fines distintos a la donación de bienes.',
      },
      {
        titulo: 'Responsabilidad',
        texto:
          'DonaTrack facilita la registración, asignación y seguimiento de las donaciones. La entrega física de los bienes la coordinan el depósito y el equipo de logística.',
      },
    ],
  },
  privacidad: {
    titulo: 'Política de privacidad',
    apartados: [
      {
        titulo: 'Qué datos guardamos',
        texto:
          'Guardamos los datos de identificación y contacto que ingresás al registrarte, y el historial de tus donaciones o de las donaciones que recibe tu entidad.',
      },
      {
        titulo: 'Para qué los usamos',
        texto:
          'Los usamos para asignar donaciones, avisarte sobre su estado por el medio de contacto que elegiste y calcular métricas e incentivos.',
      },
      {
        titulo: 'Qué se muestra públicamente',
        texto:
          'En la página pública y en el mapa solo se muestran la entidad beneficiaria, qué se entregó y cuándo. Nunca se publican datos personales de las personas donantes.',
      },
      {
        titulo: 'Tus derechos',
        texto:
          'Podés pedir acceder, corregir o eliminar tus datos escribiendo al equipo de DonaTrack.',
      },
    ],
  },
};

/**
 * Páginas públicas de información legal y política de privacidad.
 * El contenido es un texto base: el equipo debe revisarlo antes de publicarlo.
 */
export const LegalPage = ({ tipo }: { tipo: 'legal' | 'privacidad' }) => {
  const { titulo, apartados } = CONTENIDO[tipo];
  return (
    <Box minH="100vh" bg="gray.50" py={{ base: '8', md: '14' }}>
      <Container maxW="3xl">
        <VStack align="start" gap="6" bg="white" p={{ base: '6', md: '10' }} borderRadius="2xl" borderWidth="1px">
          <Heading as="h1" size="2xl">{titulo}</Heading>
          {apartados.map((a) => (
            <Box key={a.titulo}>
              <Heading as="h2" size="md" mb="2">{a.titulo}</Heading>
              <Text color="gray.700">{a.texto}</Text>
            </Box>
          ))}
          <Button asChild variant="outline" colorPalette="teal" minH="48px">
            <RouterLink to="/">Volver al inicio</RouterLink>
          </Button>
        </VStack>
      </Container>
    </Box>
  );
};
