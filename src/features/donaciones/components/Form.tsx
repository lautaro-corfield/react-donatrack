import { useRef, useState, type FormEvent } from 'react';
import { Button, Card, Field, Heading, Input, NativeSelect, SimpleGrid, Stack, Text, chakra } from '@chakra-ui/react';
import type { DonanteEncontrado } from '@/features/donantes/model/types';
import type { BienDonado, CreateDonacionDTO, UpdateDonacionDTO } from '../model/types';
import { BuscadorDonante, type BuscadorDonanteProps } from './BuscadorDonante';

interface FormBase {
  isLoading: boolean;
  onCancel: () => void;
}

export type DonacionFormProps = FormBase & (
  | { modo: 'crear'; buscarDonantes: BuscadorDonanteProps['buscar']; onSubmit: (data: CreateDonacionDTO) => Promise<void> }
  | { modo: 'editar'; descripcion: string; onSubmit: (data: UpdateDonacionDTO) => Promise<void> }
);

function DatosBien({ id, numero, disabled, onRemove }: {
  id: number;
  numero: number;
  disabled: boolean;
  onRemove?: () => void;
}) {
  const [perecedero, setPerecedero] = useState(false);
  const campo = (nombre: string) => `bien-${id}-${nombre}`;

  return (
    <chakra.fieldset display="flex" flexDirection="column" gap="4" p="4" borderWidth="1px" borderRadius="xl" disabled={disabled}>
      <Heading as="legend" size="sm" px="1">Bien {numero}</Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
        <Field.Root required>
          <Field.Label>Nombre <Field.RequiredIndicator /></Field.Label>
          <Input name={campo('nombre')} placeholder="Ej. Paquetes de arroz" required minH="12" borderRadius="xl" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>Descripción del bien <Field.RequiredIndicator /></Field.Label>
          <Input name={campo('descripcion')} placeholder="Ej. Paquetes cerrados de 1 kg" required minH="12" borderRadius="xl" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>Categoría <Field.RequiredIndicator /></Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field name={campo('categoria')} defaultValue="" minH="12" borderRadius="xl">
              <option value="" disabled>Elegí una categoría</option>
              <option value="ALIMENTOS">Alimentos</option>
              <option value="MOBILIARIO">Mobiliario</option>
              <option value="VESTIMENTA">Vestimenta</option>
              <option value="HIGIENE">Higiene</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        <Field.Root required>
          <Field.Label>Subcategoría <Field.RequiredIndicator /></Field.Label>
          <Input name={campo('subcategoria')} placeholder="Ej. Arroz" required minH="12" borderRadius="xl" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>Cantidad <Field.RequiredIndicator /></Field.Label>
          <Input name={campo('cantidad')} type="number" min="1" max="10000" step="1" placeholder="Ej. 30"
            required minH="12" borderRadius="xl" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>Unidad de medida <Field.RequiredIndicator /></Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field name={campo('unidad')} minH="12" borderRadius="xl">
              <option value="UNIDADES">Unidades</option>
              <option value="KG">Kilogramos</option>
              <option value="METROS">Metros</option>
              <option value="LITROS">Litros</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        <Field.Root required>
          <Field.Label>Tipo de bien <Field.RequiredIndicator /></Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field name={campo('tipo')} value={perecedero ? 'PERECEDERO' : 'DURADERO'}
              onChange={event => setPerecedero(event.target.value === 'PERECEDERO')} minH="12" borderRadius="xl">
              <option value="DURADERO">Duradero</option>
              <option value="PERECEDERO">Perecedero</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        {perecedero ? (
          <Field.Root required>
            <Field.Label>Fecha de vencimiento <Field.RequiredIndicator /></Field.Label>
            <Input name={campo('vencimiento')} type="date" required minH="12" borderRadius="xl" />
          </Field.Root>
        ) : (
          <Field.Root required>
            <Field.Label>Condición del bien <Field.RequiredIndicator /></Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field name={campo('estado')} minH="12" borderRadius="xl">
                <option value="NUEVO">Nuevo</option>
                <option value="USADO">Usado</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
        )}
      </SimpleGrid>
      <Field.Root>
        <Field.Label>Enlace a la foto (opcional)</Field.Label>
        <Input name={campo('foto')} type="url" placeholder="https://…" minH="12" borderRadius="xl" />
      </Field.Root>
      {onRemove && <Button type="button" variant="ghost" colorPalette="red" alignSelf="start" minH="12"
        onClick={onRemove} aria-label={`Quitar bien ${numero}`}>Quitar bien</Button>}
    </chakra.fieldset>
  );
}

function leerBien(datos: FormData, id: number): BienDonado {
  const leer = (nombre: string) => String(datos.get(`bien-${id}-${nombre}`) ?? '').trim();
  const tipo = leer('tipo') as BienDonado['tipo'];

  return {
    nombre: leer('nombre'),
    descripcion: leer('descripcion'),
    cantidad: Number(leer('cantidad')),
    foto: leer('foto') || undefined,
    tipo,
    subCategoria: {
      categoria: leer('categoria') as BienDonado['subCategoria']['categoria'],
      descripcion: leer('subcategoria'),
      unidad: leer('unidad') as BienDonado['subCategoria']['unidad'],
    },
    ...(tipo === 'PERECEDERO'
      ? { fechaVencimiento: `${leer('vencimiento')}T12:00:00-03:00` }
      : { estadoBien: leer('estado') as BienDonado['estadoBien'] }),
  };
}

export function DonacionForm(props: DonacionFormProps) {
  const [seleccionado, setSeleccionado] = useState<DonanteEncontrado | null>(null);
  const [bienes, setBienes] = useState([0]);
  const [error, setError] = useState('');
  const siguienteId = useRef(1);
  const { isLoading, onCancel } = props;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const datos = new FormData(event.currentTarget);
    const descripcion = String(datos.get('descripcion') ?? '').trim();
    setError('');
    if (!descripcion) {
      setError('Ingresá una descripción de la donación.');
      return;
    }
    if (props.modo === 'editar') {
      await props.onSubmit({ descripcion });
    } else if (seleccionado) {
      const detalle = bienes.map(id => leerBien(datos, id));
      if (detalle.some(bien => !bien.nombre || !bien.descripcion || !bien.subCategoria.descripcion)) {
        setError('Completá el nombre, la descripción y la subcategoría de cada bien.');
        return;
      }
      await props.onSubmit({ descripcion, donanteId: seleccionado.id, bienes: detalle });
    }
  }

  return (
    <Card.Root borderWidth="1px" borderRadius="2xl" shadow="sm" p={{ base: '4', md: '6' }} bg="white">
      <form onSubmit={handleSubmit}>
        <Stack gap="5">
          {props.modo === 'crear' && (
            <BuscadorDonante buscar={props.buscarDonantes} seleccionado={seleccionado}
              onSelect={setSeleccionado} disabled={isLoading} />
          )}
          <Field.Root required>
            <Field.Label>Descripción de la donación <Field.RequiredIndicator /></Field.Label>
            <Input name="descripcion" placeholder="Ej. Alimentos para el depósito" required disabled={isLoading}
              defaultValue={props.modo === 'editar' ? props.descripcion : ''} minH="12" borderRadius="xl" />
          </Field.Root>
          {props.modo === 'crear' && (
            <>
              <Text fontSize="sm" color="gray.700">Los bienes ingresan al depósito. El destino se asigna después mediante matchmaking.</Text>
              {bienes.map((id, index) => (
                <DatosBien key={id} id={id} numero={index + 1} disabled={isLoading}
                  onRemove={bienes.length > 1 ? () => setBienes(actuales => actuales.filter(bien => bien !== id)) : undefined} />
              ))}
              <Button type="button" variant="outline" alignSelf="start" minH="12" borderRadius="xl"
                disabled={isLoading} onClick={() => {
                  const id = siguienteId.current++;
                  setBienes(actuales => [...actuales, id]);
                }}>
                Agregar otro bien
              </Button>
            </>
          )}
          {error && <Text color="red.700" role="alert">{error}</Text>}
          <Stack direction={{ base: 'column-reverse', sm: 'row' }} justify="flex-end" gap="3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} minH="12" borderRadius="xl">
              Cancelar
            </Button>
            <Button type="submit" colorPalette="teal" loading={isLoading} minH="12" borderRadius="xl"
              disabled={props.modo === 'crear' && !seleccionado}>
              Guardar donación
            </Button>
          </Stack>
        </Stack>
      </form>
    </Card.Root>
  );
}
