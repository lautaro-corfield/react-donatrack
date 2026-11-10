import { useState } from 'react';
import { Button, Field, Input, Stack, Text } from '@chakra-ui/react';
import type { DonanteEncontrado } from '@/features/donantes/model/types';

export interface BuscadorDonanteProps {
  buscar: (valor: string) => Promise<DonanteEncontrado[]>;
  seleccionado: DonanteEncontrado | null;
  onSelect: (donante: DonanteEncontrado | null) => void;
  disabled: boolean;
}

export function BuscadorDonante({ buscar, seleccionado, onSelect, disabled }: BuscadorDonanteProps) {
  const [valor, setValor] = useState('');
  const [resultados, setResultados] = useState<DonanteEncontrado[] | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');

  async function consultar() {
    const entrada = valor.trim();
    if (!entrada || buscando || disabled) return;

    onSelect(null);
    setResultados(null);
    setError('');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(entrada) && !/^\d{1,8}$/.test(entrada.replace(/[.\s-]/g, ''))) {
      setError('Ingresá un correo electrónico completo o un DNI válido.');
      return;
    }

    setBuscando(true);
    try {
      setResultados(await buscar(entrada));
    } catch {
      setError('No se pudo buscar al donante. Intentá de nuevo.');
    } finally {
      setBuscando(false);
    }
  }

  return (
    <Stack gap="3">
      <Field.Root invalid={Boolean(error)}>
        <Field.Label>Donante registrado (obligatorio)</Field.Label>
        <Stack direction={{ base: 'column', sm: 'row' }} w="full">
          <Input
            type="search"
            placeholder="Ej. donante@correo.com o 12.345.678"
            value={valor}
            disabled={disabled || buscando}
            minH="12"
            borderRadius="xl"
            onChange={event => {
              setValor(event.target.value);
              setResultados(null);
              setError('');
              onSelect(null);
            }}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void consultar();
              }
            }}
          />
          <Button type="button" variant="outline" minH="12" borderRadius="xl" loading={buscando}
            disabled={disabled || !valor.trim()} onClick={() => void consultar()}>
            Buscar donante
          </Button>
        </Stack>
        <Field.ErrorText role="alert">{error}</Field.ErrorText>
      </Field.Root>

      <Text role="status" fontSize="sm" color="gray.700">
        {seleccionado
          ? `Donante seleccionado: ${seleccionado.nombre} (ID ${seleccionado.id})`
          : resultados?.length === 0
            ? 'No encontramos donantes con ese dato. Revisalo o registrá al donante antes de continuar.'
            : resultados
              ? 'Seleccioná el donante que hizo la donación.'
              : 'Buscá por correo o DNI para vincular la donación al perfil correcto.'}
      </Text>

      {resultados && resultados.length > 0 && (
        <Stack as="ul" listStyleType="none" gap="2">
          {resultados.map(donante => (
            <li key={donante.id}>
              <Button type="button" aria-pressed={seleccionado?.id === donante.id}
                variant={seleccionado?.id === donante.id ? 'solid' : 'outline'}
                colorPalette="teal" borderRadius="xl" minH="12" maxW="full" whiteSpace="normal"
                disabled={disabled} onClick={() => onSelect(donante)}>
                {donante.nombre} · ID {donante.id}
              </Button>
            </li>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
