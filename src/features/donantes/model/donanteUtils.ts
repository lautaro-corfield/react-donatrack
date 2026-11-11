import type { Donante } from './types';

/**
 * Obtiene el correo electrónico real del donante.
 * Garantiza que NUNCA devuelva un número de teléfono, incluso si el
 * medio de contacto preferido / predeterminado es WhatsApp o SMS.
 */
export function getDonanteEmail(donante: Donante | null | undefined): string {
  if (!donante?.persona) return '';
  const p = donante.persona;

  // 1. Buscar en medioDeContacto.EMAIL (Map tipado de Spring Boot)
  if (p.medioDeContacto?.EMAIL && p.medioDeContacto.EMAIL.length > 0) {
    const email = p.medioDeContacto.EMAIL.find(
      (val) => typeof val === 'string' && val.includes('@')
    );
    if (email) return email.trim();
  }

  // 2. Si mediosDeContacto vino como array de objetos [{ tipoNotificador/medio, valor }]
  if (Array.isArray(p.mediosDeContacto)) {
    const item = p.mediosDeContacto.find(
      (m) =>
        (m.tipoNotificador === 'EMAIL' || m.medio === 'EMAIL') &&
        typeof m.valor === 'string' &&
        m.valor.includes('@')
    );
    if (item?.valor) return item.valor.trim();
  }

  // 3. Si medioPredeterminado es explícitamente EMAIL
  if (
    p.medioPredeterminado?.medio === 'EMAIL' &&
    p.medioPredeterminado.valor &&
    p.medioPredeterminado.valor.includes('@')
  ) {
    return p.medioPredeterminado.valor.trim();
  }

  // 4. Si medioPredeterminado.valor contiene un '@'
  if (p.medioPredeterminado?.valor && p.medioPredeterminado.valor.includes('@')) {
    return p.medioPredeterminado.valor.trim();
  }

  // 5. Búsqueda exhaustiva en cualquier array de medioDeContacto que contenga '@'
  if (p.medioDeContacto) {
    for (const key of Object.keys(p.medioDeContacto)) {
      const found = p.medioDeContacto[key]?.find(
        (v) => typeof v === 'string' && v.includes('@')
      );
      if (found) return found.trim();
    }
  }

  return '';
}

/**
 * Obtiene el número de teléfono real del donante (Móvil / WhatsApp / SMS).
 * Garantiza que NUNCA devuelva una dirección de correo electrónico.
 */
export function getDonanteTelefono(donante: Donante | null | undefined): string {
  if (!donante?.persona) return '';
  const p = donante.persona;

  // 1. Si el medio preferido es WHATSAPP o SMS y su valor no es email
  if (
    (p.medioPredeterminado?.medio === 'WHATSAPP' ||
      p.medioPredeterminado?.medio === 'SMS') &&
    p.medioPredeterminado.valor &&
    !p.medioPredeterminado.valor.includes('@')
  ) {
    return p.medioPredeterminado.valor.trim();
  }

  // 2. Buscar en listas conocidas de teléfono en medioDeContacto
  const candidatos = [
    ...(p.medioDeContacto?.WHATSAPP || []),
    ...(p.medioDeContacto?.SMS || []),
    ...(p.medioDeContacto?.TELEFONO || []),
  ];
  const tel = candidatos.find(
    (v) => typeof v === 'string' && !v.includes('@') && v.trim().length > 0
  );
  if (tel) return tel.trim();

  // 3. Si mediosDeContacto es una lista de objetos
  if (Array.isArray(p.mediosDeContacto)) {
    const item = p.mediosDeContacto.find(
      (m) =>
        (m.tipoNotificador === 'WHATSAPP' ||
          m.tipoNotificador === 'SMS' ||
          m.tipoNotificador === 'TELEFONO' ||
          m.medio === 'WHATSAPP' ||
          m.medio === 'SMS' ||
          m.medio === 'TELEFONO') &&
        typeof m.valor === 'string' &&
        !m.valor.includes('@')
    );
    if (item?.valor) return item.valor.trim();
  }

  // 4. Si medioPredeterminado.valor no contiene '@' y parece teléfono
  if (
    p.medioPredeterminado?.valor &&
    !p.medioPredeterminado.valor.includes('@') &&
    p.medioPredeterminado.valor.trim().length > 0
  ) {
    return p.medioPredeterminado.valor.trim();
  }

  return '';
}

/**
 * Extrae el nombre de la calle del domicilio del donante (soporta calle1 o calle).
 */
export function getDonanteCalle(donante: Donante | null | undefined): string {
  const dir = donante?.persona?.direccion;
  if (!dir) return '';
  return dir.calle1 || dir.calle || '';
}

/**
 * Extrae la altura/número del domicilio del donante.
 */
export function getDonanteAltura(donante: Donante | null | undefined): string {
  const dir = donante?.persona?.direccion;
  if (!dir || dir.altura === undefined || dir.altura === null || dir.altura === 0) return '';
  return String(dir.altura);
}

/**
 * Extrae el piso del domicilio del donante.
 */
export function getDonantePiso(donante: Donante | null | undefined): string {
  const dir = donante?.persona?.direccion;
  if (!dir || dir.piso === undefined || dir.piso === null || dir.piso === 0) return '';
  return String(dir.piso);
}

/**
 * Extrae el departamento del domicilio del donante (soporta departamento o depto).
 */
export function getDonanteDepto(donante: Donante | null | undefined): string {
  const dir = donante?.persona?.direccion;
  if (!dir) return '';
  return dir.departamento || dir.depto || '';
}

/**
 * Retorna el domicilio completo y legible del donante.
 * Nunca produce 'undefined'.
 */
export function getDonanteDireccion(donante: Donante | null | undefined): string {
  const dir = donante?.persona?.direccion;
  if (!dir) return 'No informada';

  // Si el backend ya devolvió el string formateado por getDireccion()
  if (dir.direccion && dir.direccion.trim().length > 0) {
    return dir.direccion.trim();
  }

  const calle = dir.calle1 || dir.calle;
  const altura = dir.altura && dir.altura > 0 ? dir.altura : (dir.sinAltura ? 'S/N' : '');
  const piso = dir.piso && dir.piso !== 0 ? dir.piso : '';
  const depto = dir.departamento || dir.depto || '';

  if (!calle && !altura) return 'No informada';

  let res = calle || '';
  if (altura) res += ` ${altura}`;
  if (piso || depto) {
    const extras: string[] = [];
    if (piso) extras.push(`${piso}°`);
    if (depto) extras.push(depto);
    res += ` (${extras.join(' ')})`;
  }

  return res.trim() || 'No informada';
}
