import { useEffect, useState } from 'react';
import { errorDonantes } from '../api/donantesApi';

type Resultado<T> = { datos: T; error?: never } | { datos?: never; error: string };

export function useConsulta<T>(cargar: (signal: AbortSignal) => Promise<T>) {
  const [version, setVersion] = useState(0);
  const [respuesta, setRespuesta] = useState<{ version: number; resultado: Resultado<T> }>();
  useEffect(() => {
    const controlador = new AbortController();
    cargar(controlador.signal).then(
      datos => {
        if (!controlador.signal.aborted) setRespuesta({ version, resultado: { datos } });
      },
      error => {
        if (!controlador.signal.aborted) setRespuesta({ version, resultado: { error: errorDonantes(error) } });
      },
    );
    return () => controlador.abort();
  }, [cargar, version]);

  const resultado = respuesta?.version === version ? respuesta.resultado : undefined;
  return {
    datos: resultado?.datos,
    error: resultado?.error,
    recargar: () => setVersion(actual => actual + 1),
  };
}
