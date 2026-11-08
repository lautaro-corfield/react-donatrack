# Reglas de Arquitectura Frontend - DonaTrack

## 1. Stack Tecnológico Obligatorio
- **Framework:** React 18+ (Vite) con TypeScript estricto.
- **UI & Estilos:** Chakra UI v3. No utilizar CSS puro ni librerías de estilos adicionales.
- **Manejo de Estado:** Zustand (para estado global y sesión). Evitar Context API para datos de alta mutación.
- **Cliente HTTP:** Axios.
- **SSO:** `@react-oauth/google`.

## 2. Patrón Arquitectónico (Feature-Sliced Design)
El código debe modularizarse por dominio de negocio (features) dentro de `src/features/`. Está prohibido agrupar archivos por tipo técnico (ej. no usar `src/components` para componentes específicos de un dominio).
Estructura exigida para cada feature:
- `api/`: Llamadas HTTP exclusivas de este dominio usando Axios.
- `model/`: Definición de interfaces TS y el store de Zustand correspondiente.
- `components/`: Componentes de React que construyen la UI de esta feature.

## 3. Flujo de Autenticación (Token Swap)
La aplicación utiliza un patrón estricto de intercambio de tokens (Token Swap) contra el backend de microservicios:
1. El componente UI usará el SDK de Google para recuperar el `id_token` nativo.
2. Inmediatamente se realizará un POST a `servicio-iam` (`/api/auth/social/google`) enviando este token.
3. El frontend descartará el token de Google y utilizará EXCLUSIVAMENTE el JWT devuelto por `servicio-iam` como sesión activa de DonaTrack.
4. El token de DonaTrack se almacenará de forma persistente utilizando el middleware `persist` de Zustand.

## 4. Políticas de Seguridad e Interceptores
- Ningún componente debe adjuntar tokens manualmente a sus peticiones.
- Debe existir una instancia global de Axios (`httpClient`) configurada con un `interceptor` de request.
- El interceptor leerá el token de Zustand y lo inyectará en el header `Authorization: Bearer <token>`.
- Debe existir un `interceptor` de response: si cualquier microservicio (ej. `servicio-logistica`) devuelve un HTTP 401, el interceptor debe ejecutar la función `logout()` de Zustand de manera imperativa y redirigir a la vista de login.