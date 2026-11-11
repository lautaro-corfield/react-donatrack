import { Box, Button, Field, Heading, Input, NativeSelect, SimpleGrid, Stack, Tabs, Text } from '@chakra-ui/react';
import { useState, type FormEvent } from 'react';
import type { AltaDonante, TipoNotificador } from '../model/types';

type TipoDonante = 'humano' | 'juridico';
type Campo = 'nombre' | 'apellido' | 'documento' | 'edad' | 'genero' | 'rubro' | 'organizacion' | 'representanteNombre' | 'representanteApellido' | 'representanteDocumento' | 'email' | 'telefono' | 'calle' | 'altura' | 'ciudad' | 'provincia' | 'pais';
type Datos = Partial<Record<Campo, string>>;

const section = { borderWidth: '1px', borderColor: 'gray.200', borderRadius: '2xl', p: { base: '5', md: '7' }, boxShadow: 'sm' } as const;

export function Form({ guardando, onSubmit }: {
  guardando: boolean;
  onSubmit: (tipo: TipoDonante, datos: AltaDonante, password: string) => Promise<boolean>;
}) {
  const [tipo, setTipo] = useState<TipoDonante>('humano');
  const [datos, setDatos] = useState<Datos>({});
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');
  const [medioPreferido, setMedioPreferido] = useState<TipoNotificador>('EMAIL');

  function campo(nombre: Campo, etiqueta: string, placeholder: string, props: React.ComponentProps<typeof Input> = {}) {
    return <Field.Root required={props.required}>
      <Field.Label>{etiqueta}{props.required && <Text as="span" color="red.500"> *</Text>}</Field.Label>
      <Input minH="12" borderRadius="xl" name={nombre} value={datos[nombre] ?? ''} onChange={e => setDatos(actual => ({ ...actual, [nombre]: e.target.value }))} placeholder={placeholder} {...props} />
    </Field.Root>;
  }

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (password && (password.length < 8 || password !== confirmacion)) {
      setError('La contraseña debe tener al menos 8 caracteres y coincidir con la confirmación.');
      return;
    }
    const telefono = datos.telefono?.trim() ?? '';
    if (medioPreferido !== 'EMAIL' && !telefono) {
      setError('Ingresá un teléfono para usar WhatsApp o mensajes de texto como canal preferido.');
      return;
    }
    const representante = [datos.representanteNombre, datos.representanteApellido, datos.representanteDocumento];
    if (tipo === 'juridico' && representante.some(Boolean) &&
        (representante.some(valor => !valor?.trim()) || !/^\d+$/.test(datos.representanteDocumento ?? ''))) {
      setError('Completá el nombre, apellido y documento de la persona representante.');
      return;
    }
    const mediosDeContacto = [{ medio: 'EMAIL', valor: datos.email?.trim() ?? '' }];
    if (telefono) mediosDeContacto.push({ medio: medioPreferido === 'WHATSAPP' ? 'WHATSAPP' : 'SMS', valor: telefono });
    const medioPredeterminado = {
      medio: medioPreferido,
      valor: medioPreferido === 'EMAIL' ? datos.email?.trim() ?? '' : telefono,
    };
    const direccion = datos.calle ? {
      calle1: datos.calle.trim(), altura: Number(datos.altura), sinAltura: !datos.altura,
      ciudadNombre: datos.ciudad?.trim() ?? '', provinciaNombre: datos.provincia?.trim() ?? '', paisNombre: datos.pais?.trim() ?? '',
    } : undefined;
    const identificacion = tipo === 'humano'
      ? { nombre: datos.nombre?.trim() ?? '', apellido: datos.apellido?.trim() ?? '', nroDocumento: datos.documento?.trim() ?? '', edad: Number(datos.edad), genero: datos.genero?.trim() ?? '' }
      : { razonSocial: datos.nombre?.trim() ?? '', cuit: datos.documento?.trim() ?? '', rubro: datos.rubro?.trim() ?? '', tipo: datos.organizacion ?? 'EMPRESA',
          representantes: representante.some(Boolean) ? [{ nombre: datos.representanteNombre!.trim(), apellido: datos.representanteApellido!.trim(), nroDocumento: Number(datos.representanteDocumento) }] : [] };
    if (await onSubmit(tipo, { ...identificacion, mediosDeContacto, medioPredeterminado, direccion }, password)) {
      setDatos({}); setPassword(''); setConfirmacion(''); setTipo('humano'); setMedioPreferido('EMAIL');
    }
  }

  return <form onSubmit={enviar}>
    <Stack gap="7">
      <Box {...section}>
        <Heading as="h3" size="md" color="teal.800" mb="5">1. Tu cuenta</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
          {campo('email', 'Correo electrónico', 'donante@ejemplo.com', { type: 'email', required: true, autoComplete: 'email' })}
          <Box />
          <Field.Root><Field.Label>Contraseña</Field.Label><Input minH="12" borderRadius="xl" type="password" minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Al menos 8 caracteres" /></Field.Root>
          <Field.Root><Field.Label>Confirmar contraseña</Field.Label><Input minH="12" borderRadius="xl" type="password" autoComplete="new-password" value={confirmacion} onChange={e => setConfirmacion(e.target.value)} placeholder="Repetí tu contraseña" /></Field.Root>
        </SimpleGrid>
        <Text color="gray.500" fontSize="sm" mt="3">Para registrarte con Google podés dejar la contraseña vacía.</Text>
      </Box>

      <Box {...section}>
        <Heading as="h3" size="md" color="teal.800" mb="5">2. Datos de identidad</Heading>
        <Tabs.Root value={tipo} onValueChange={({ value }) => { setTipo(value as TipoDonante); setDatos(actual => ({ email: actual.email, telefono: actual.telefono, calle: actual.calle, altura: actual.altura, ciudad: actual.ciudad, provincia: actual.provincia, pais: actual.pais })); }} variant="plain" mb="5">
          <Tabs.List bg="gray.100" borderWidth="1px" borderColor="gray.200" borderRadius="full" p="1">
            <Tabs.Trigger value="humano" borderRadius="full" _selected={{ bg: 'teal.600', color: 'white' }}>Persona física</Tabs.Trigger>
            <Tabs.Trigger value="juridico" borderRadius="full" _selected={{ bg: 'teal.600', color: 'white' }}>Persona jurídica</Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
          {campo('nombre', tipo === 'humano' ? 'Nombre' : 'Razón social', tipo === 'humano' ? 'Ej. María' : 'Ej. Fundación Esperanza', { required: true })}
          {tipo === 'humano' && campo('apellido', 'Apellido', 'Ej. Pérez', { required: true })}
          {campo('documento', tipo === 'humano' ? 'DNI / Documento' : 'CUIT', 'Ej. 30123456', { required: true })}
          {tipo === 'humano' ? <>
            {campo('edad', 'Edad', 'Ej. 35', { type: 'number', min: '1', max: '120', required: true })}
            {campo('genero', 'Género', 'Prefiero no decir')}
          </> : <>
            {campo('rubro', 'Rubro', 'Ej. Alimentación', { required: true })}
            <Field.Root><Field.Label>Tipo de organización</Field.Label><NativeSelect.Root><NativeSelect.Field minH="12" borderRadius="xl" value={datos.organizacion ?? 'EMPRESA'} onChange={e => setDatos(actual => ({ ...actual, organizacion: e.target.value }))}><option value="EMPRESA">Empresa</option><option value="ONG">ONG</option><option value="GUBERNAMENTAL">Gubernamental</option><option value="INSTITUCION">Institución</option></NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root></Field.Root>
          </>}
        </SimpleGrid>
        {tipo === 'juridico' && <Stack gap="4" mt="6" p="5" bg="purple.50" borderWidth="1px" borderColor="purple.100" borderRadius="xl">
          <Heading as="h4" size="sm" color="purple.700">Persona representante designada (opcional)</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
            {campo('representanteNombre', 'Nombre', 'Ej. Martín')}
            {campo('representanteApellido', 'Apellido', 'Ej. Gómez')}
            {campo('representanteDocumento', 'N° Documento', 'Ej. 34567890', { inputMode: 'numeric' })}
          </SimpleGrid>
        </Stack>}
      </Box>

      <Box {...section}>
        <Heading as="h3" size="md" color="teal.800" mb="5">3. Contacto y domicilio</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
          {campo('telefono', 'Teléfono / Móvil', 'Ej. +54 11 4455-6677', { type: 'tel' })}
          <Field.Root><Field.Label>Canal de contacto preferido</Field.Label><NativeSelect.Root><NativeSelect.Field minH="12" borderRadius="xl" value={medioPreferido} onChange={e => setMedioPreferido(e.target.value as TipoNotificador)}><option value="EMAIL">Correo electrónico</option><option value="WHATSAPP">WhatsApp</option><option value="SMS">Mensaje de texto (SMS)</option></NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root></Field.Root>
          {campo('calle', 'Calle', 'Ej. Av. Corrientes', { required: tipo === 'humano' })}
          {campo('altura', 'Altura', 'Ej. 1234', { type: 'number', min: '1' })}
          {campo('ciudad', 'Ciudad', 'Ej. CABA', { required: tipo === 'humano' })}
          {campo('provincia', 'Provincia', 'Ej. Buenos Aires', { required: tipo === 'humano' })}
          {campo('pais', 'País', 'Ej. Argentina')}
        </SimpleGrid>
      </Box>
      {error && <Text role="alert" color="red.600">{error}</Text>}
      <Button type="submit" colorPalette="teal" borderRadius="full" minH="12" loading={guardando} alignSelf="end">Continuar</Button>
    </Stack>
  </form>;
}
