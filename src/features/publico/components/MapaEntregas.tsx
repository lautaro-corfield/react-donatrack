import { useEffect, useState } from 'react';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { publicoApi } from '../api/publicoApi';
import { descripcionDonacion, fechaCorta } from '../model/format';
import type { DonacionPublica } from '../model/types';

// Leaflet busca las imágenes del marcador por URL relativa, que Vite no resuelve.
// Se le pasan las importadas para que el bundler las incluya.
const iconoMarcador = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Centro de Argentina para cuando no hay entregas.
const CENTRO_POR_DEFECTO: [number, number] = [-38.4161, -63.6167];

/**
 * Mapa interactivo de donaciones entregadas (OpenStreetMap + Leaflet).
 * Al seleccionar un marcador se ve qué se entregó, a qué entidad y cuándo.
 */
export const MapaEntregas = () => {
  const [entregas, setEntregas] = useState<DonacionPublica[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    publicoApi
      .entregas()
      .then(setEntregas)
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <VStack h="420px" justify="center" role="status" aria-live="polite">
        <Spinner size="lg" color="teal.500" />
        <Text fontSize="sm" color="gray.600">Cargando el mapa de entregas…</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack h="420px" justify="center" role="alert">
        <Text color="gray.700">No pudimos cargar el mapa en este momento.</Text>
        <Text fontSize="sm" color="gray.500">Probá recargar la página en unos minutos.</Text>
      </VStack>
    );
  }

  const conUbicacion = entregas.filter((e) => e.latitud !== null && e.longitud !== null);
  const centro: [number, number] = conUbicacion.length
    ? [conUbicacion[0].latitud as number, conUbicacion[0].longitud as number]
    : CENTRO_POR_DEFECTO;

  return (
    <Box>
      <Box
        h={{ base: '320px', md: '440px' }}
        borderRadius="xl"
        overflow="hidden"
        borderWidth="1px"
        aria-label="Mapa de donaciones entregadas"
      >
        <MapContainer
          center={centro}
          zoom={conUbicacion.length ? 12 : 4}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {conUbicacion.map((e) => (
            <Marker
              key={e.id}
              position={[e.latitud as number, e.longitud as number]}
              icon={iconoMarcador}
              title={e.entidad ?? 'Donación entregada'}
            >
              <Popup>
                <strong>{e.entidad ?? 'Entidad beneficiaria'}</strong>
                <br />
                {descripcionDonacion(e)}
                <br />
                {e.direccion && (
                  <>
                    {e.direccion}
                    <br />
                  </>
                )}
                Entregada el {fechaCorta(e.fechaEntrega)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
      <Text fontSize="sm" color="gray.600" mt="2">
        {conUbicacion.length
          ? `${conUbicacion.length} ${conUbicacion.length === 1 ? 'entrega realizada' : 'entregas realizadas'}. Tocá un marcador para ver el detalle.`
          : 'Todavía no hay entregas con ubicación para mostrar.'}
      </Text>
    </Box>
  );
};
