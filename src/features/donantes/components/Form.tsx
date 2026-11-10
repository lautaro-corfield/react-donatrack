import { Button, Field, Heading, Input, NativeSelect, SimpleGrid, Stack, Steps, Text } from '@chakra-ui/react';
import { useState, type ComponentProps, type FormEvent, type ReactNode } from 'react';
import type { AltaDonante } from '../model/types';
import { control } from './styles';

type TipoDonante = 'humano' | 'juridico';
type CampoNombre = 'nombre' | 'apellido' | 'documento' | 'edad' | 'genero' | 'rubro' | 'organizacion' | 'email' | 'telefono' | 'calle' | 'altura' | 'ciudad' | 'provincia' | 'pais';
type DatosFormulario = Partial<Record<CampoNombre, string>>;

function Campo({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return <Field.Root><Field.Label>{etiqueta}</Field.Label>{children}</Field.Root>;
}

const pasos = ['Datos personales', 'Medios de contacto', 'Dirección'];

export function Form({ guardando, onSubmit, etiquetaFinal = 'Registrar donante' }: {
  guardando: boolean;
  onSubmit: (tipo: TipoDonante, datos: AltaDonante) => Promise<boolean>;
  etiquetaFinal?: string;
}) {
  const [tipo, setTipo] = useState<TipoDonante>('humano');
  const [paso, setPaso] = useState(0);
  const [datos, setDatos] = useState<DatosFormulario>({});

  function guardarPaso(form: HTMLFormElement) {
    const valores = Object.fromEntries(new FormData(form).entries());
    const nuevosDatos = Object.fromEntries(Object.entries(valores).map(([clave, valor]) => [clave, String(valor).trim()]));
    setDatos(actuales => ({ ...actuales, ...nuevosDatos }));
    return { ...datos, ...nuevosDatos } as DatosFormulario;
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = evento.currentTarget;
    if (paso < pasos.length - 1) {
      if (form.reportValidity()) {
        guardarPaso(form);
        setPaso(actual => actual + 1);
      }
      return;
    }

    const valores = guardarPaso(form);
    const mediosDeContacto = [{ medio: 'EMAIL', valor: valores.email ?? '' }];
    if (valores.telefono) mediosDeContacto.push({ medio: 'SMS', valor: valores.telefono });
    const direccion = valores.calle ? {
      calle1: valores.calle,
      altura: Number(valores.altura),
      sinAltura: !valores.altura,
      ciudadNombre: valores.ciudad ?? '',
      provinciaNombre: valores.provincia ?? '',
      paisNombre: valores.pais ?? '',
    } : undefined;
    const identificacion = tipo === 'humano'
      ? {
          nombre: valores.nombre ?? '',
          apellido: valores.apellido ?? '',
          nroDocumento: valores.documento ?? '',
          edad: Number(valores.edad),
          genero: valores.genero ?? '',
        }
      : {
          razonSocial: valores.nombre ?? '',
          cuit: valores.documento ?? '',
          rubro: valores.rubro ?? '',
          tipo: valores.organizacion ?? 'EMPRESA',
        };

    if (await onSubmit(tipo, { ...identificacion, mediosDeContacto, direccion })) {
      setDatos({});
      setPaso(0);
      setTipo('humano');
    }
  }

  function campo(nombre: CampoNombre, placeholder: string, props: ComponentProps<typeof Input> = {}) {
    return <Input {...control} name={nombre} placeholder={placeholder} value={datos[nombre] ?? ''} onChange={evento => setDatos(actuales => ({ ...actuales, [nombre]: evento.target.value }))} {...props} />;
  }

  return (
    <form onSubmit={enviar}>
      <Stack gap="6">
        <Steps.Root count={pasos.length} step={paso} onStepChange={({ step }) => setPaso(step)} linear colorPalette="teal" size="sm">
          <Steps.List>
            {pasos.map((nombre, indice) => (
              <Steps.Item key={nombre} index={indice}>
                <Steps.Trigger disabled={indice > paso}>
                  <Steps.Indicator />
                  <Steps.Title>{nombre}</Steps.Title>
                </Steps.Trigger>
                {indice < pasos.length - 1 && <Steps.Separator />}
              </Steps.Item>
            ))}
          </Steps.List>
        </Steps.Root>
        <Text fontWeight="semibold" color="gray.700">Paso {paso + 1} de {pasos.length}: {pasos[paso]}</Text>

        {paso === 0 && <Stack gap="4">
          <Campo etiqueta="Tipo de donante">
            <NativeSelect.Root>
              <NativeSelect.Field {...control} value={tipo} onChange={evento => { setTipo(evento.target.value === 'juridico' ? 'juridico' : 'humano'); setDatos({}); }}>
                <option value="humano">Persona humana</option>
                <option value="juridico">Persona jurídica</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Campo>
          <Heading as="h2" size="md">{tipo === 'humano' ? 'Datos personales' : 'Datos de la organización'}</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            <Campo etiqueta={tipo === 'humano' ? 'Nombre' : 'Razón social'}>{campo('nombre', tipo === 'humano' ? 'Ej. María' : 'Ej. Fundación Esperanza', { required: true })}</Campo>
            {tipo === 'humano' && <Campo etiqueta="Apellido">{campo('apellido', 'Ej. Pérez', { required: true })}</Campo>}
            <Campo etiqueta={tipo === 'humano' ? 'DNI' : 'CUIT'}>{campo('documento', tipo === 'humano' ? 'Ej. 30123456' : 'Ej. 30-12345678-9', { required: true, inputMode: 'numeric' })}</Campo>
            {tipo === 'humano' ? <>
              <Campo etiqueta="Edad">{campo('edad', 'Ej. 35', { type: 'number', min: '1', max: '120', required: true })}</Campo>
              <Campo etiqueta="Género">{campo('genero', 'Seleccioná o escribí una opción')}</Campo>
            </> : <>
              <Campo etiqueta="Rubro">{campo('rubro', 'Ej. Alimentación', { required: true })}</Campo>
              <Campo etiqueta="Tipo de organización">
                <NativeSelect.Root>
                  <NativeSelect.Field {...control} name="organizacion" value={datos.organizacion ?? 'EMPRESA'} onChange={evento => setDatos(actuales => ({ ...actuales, organizacion: evento.target.value }))}>
                    <option value="EMPRESA">Empresa</option><option value="ONG">ONG</option>
                    <option value="GUBERNAMENTAL">Gubernamental</option><option value="INSTITUCION">Institución</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Campo>
            </>}
          </SimpleGrid>
        </Stack>}

        {paso === 1 && <Stack gap="4">
          <Heading as="h2" size="md">Medios de contacto</Heading>
          <Text color="gray.600">El correo debe ser una cuenta de Google para que la persona pueda iniciar sesión.</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            <Campo etiqueta="Correo de Google">{campo('email', 'nombre@gmail.com', { type: 'email', required: true, autoComplete: 'email' })}</Campo>
            <Campo etiqueta="Teléfono (opcional)">{campo('telefono', 'Ej. +54 11 1234-5678', { type: 'tel', autoComplete: 'tel' })}</Campo>
          </SimpleGrid>
        </Stack>}

        {paso === 2 && <Stack gap="4">
          <Heading as="h2" size="md">Dirección</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            <Campo etiqueta="Calle">{campo('calle', 'Ej. Av. Corrientes', { required: tipo === 'humano', autoComplete: 'address-line1' })}</Campo>
            <Campo etiqueta="Altura (opcional)">{campo('altura', 'Ej. 1234', { type: 'number', min: '1' })}</Campo>
            <Campo etiqueta="Provincia">{campo('provincia', 'Ej. Buenos Aires', { required: tipo === 'humano', autoComplete: 'address-level1' })}</Campo>
            <Campo etiqueta="País">{campo('pais', 'Ej. Argentina', { autoComplete: 'country-name' })}</Campo>
            <Campo etiqueta="Ciudad">{campo('ciudad', 'Ej. CABA', { required: tipo === 'humano', autoComplete: 'address-level2' })}</Campo>
          </SimpleGrid>
        </Stack>}

        <Stack direction="row" justify="space-between" flexWrap="wrap" gap="3">
          <Button {...control} type="button" variant="outline" onClick={() => setPaso(actual => Math.max(0, actual - 1))} disabled={paso === 0}>Anterior</Button>
          <Button {...control} type="submit" loading={guardando} colorPalette="teal">
            {paso === pasos.length - 1 ? etiquetaFinal : 'Continuar'}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
