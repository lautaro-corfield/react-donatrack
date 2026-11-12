import { useState } from 'react';
import { Button, Field, Input, Stack, Text } from '@chakra-ui/react';
import type { DonanteEncontrado } from '@/features/donantes/model/types';

export interface BuscadorDonanteProps {
  buscar: (valor: string) => Promise<DonanteEncontrado[]>;
  seleccionado: DonanteEncontrado | null;
  onSelect: (donante: DonanteEncontrado | null) => void;
  disabled: boolean;
}

function datosDeContacto(donante: DonanteEncontrado) {
  const correo = donante.email?.trim() || 'Sin correo registrado';
  const dni = donante.dni?.trim();
  return dni ? `${correo} · DNI ${dni}` : `${correo} · Sin DNI registrado`;
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
    const sinSeparadores = entrada.replace(/[.\s-]/g, '');
    const longitud = /^\d+$/.test(sinSeparadores) ? sinSeparadores.length : entrada.length;
    if (longitud < 3 || /\s/.test(entrada) && !/^\d+$/.test(sinSeparadores)) {
      setError('Ingresá al menos 3 caracteres del correo o 3 dígitos del DNI.');
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
            placeholder="Mail donante o número de DNI"
            maxLength={254}
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
          ? `Donante seleccionado: ${seleccionado.nombre} · ${datosDeContacto(seleccionado)}`
          : resultados?.length === 0
            ? 'No encontramos donantes con ese dato. Revisalo o registrá al donante antes de continuar.'
            : resultados
              ? resultados.length === 20
                ? 'Mostramos hasta 20 coincidencias. Escribí más caracteres para acotar la búsqueda.'
                : 'Seleccioná el donante que hizo la donación.'
              : 'Ingresá parte del correo o DNI y presioná Enter.'}
      </Text>

      {resultados && resultados.length > 0 && (
        <Stack as="ul" listStyleType="none" gap="2">
          {resultados.map(donante => (
            <li key={donante.id}>
              <Button type="button" aria-pressed={seleccionado?.id === donante.id}
                variant={seleccionado?.id === donante.id ? 'solid' : 'outline'}
                colorPalette="teal" borderRadius="xl" minH="12" h="auto" py="2" maxW="full" whiteSpace="normal"
                disabled={disabled} onClick={() => onSelect(donante)}>
                <Stack as="span" gap="0" minW="0" textAlign="start" overflowWrap="anywhere">
                  <Text as="span" fontWeight="semibold">{donante.nombre}</Text>
                  <Text as="span" fontSize="sm">{datosDeContacto(donante)}</Text>
                </Stack>
              </Button>
            </li>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
