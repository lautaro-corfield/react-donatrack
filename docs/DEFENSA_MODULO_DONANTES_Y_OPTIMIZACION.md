# Documento de Defensa Técnica — Módulo de Donantes y Optimización Masiva (DonaTrack)

Este documento consolida las decisiones de diseño, correcciones de dominio, arquitectura Frontend/Backend y optimizaciones de base de datos realizadas sobre **DonaTrack** (TP Anual — Diseño de Sistemas de Información 2026), estructurado como guía de referencia y defensa oral.

---

## 1. Arquitectura General y Cumplimiento de Reglas (`.rules`)

El módulo de **Donantes** respeta estrictamente el patrón **Feature-Sliced Design (FSD)** en el Frontend y una arquitectura de **Microservicios con API Gateway** en el Backend:

- **Frontend (`react-donatrack`):**
  - `src/features/donantes/api/donantesApi.ts`: Única capa que realiza llamadas HTTP usando la instancia global `httpClient.ts` (con inyección automática de `Bearer <JWT>` e interceptor de `401`).
  - `src/features/donantes/model/donantesStore.ts`: Estado global reactivo en **Zustand**, con caché de sesión, aviso explícito de modo sin conexión (`isUsingMockData`) y subida de CSV fraccionada en lotes.
  - `src/features/donantes/model/donanteUtils.ts`: Selectores puros de dominio (`getDonanteEmail`, `getDonanteTelefono`, `getDonanteDireccion`) para evitar duplicación de lógica entre vistas y modales.
  - `src/features/donantes/components/DonanteForm.tsx`: Componente presentacional reutilizado tanto para el alta manual (`Create.tsx`) como para la edición (`DonanteEditModal.tsx`).

---

## 2. Problemas de Dominio y Persistencia Resueltos

### 2.1. Alineación del Enum `TipoNotificador` (`EMAIL`, `SMS`, `WHATSAPP`)
- **Problema:** El frontend utilizaba el literal `'TELEFONO'`, que no existía en el enum `com.tp.commons.domain.notificador.TipoNotificador` del backend (`EMAIL`, `SMS`, `WHATSAPP`).
- **Solución:** Se alineó `TipoMedioContacto` en `src/features/donantes/model/types.ts` con los valores exactos de `donatrack-commons`.

### 2.2. Regla de Negocio del TP (Pág. 13): Alta con Email Duplicado actualiza al Donante
- **Requerimiento:** Si se registra un donante con un correo electrónico que ya existe en el padrón, el sistema debe actualizar sus datos en lugar de duplicarlo o rechazar la operación.
- **Problemas detectados en Backend:**
  1. `DonanteRepository.findByMedioDeContactoValor` no utilizaba `DISTINCT`, provocando `NonUniqueResultException` (HTTP 500) cuando una persona tenía más de un registro coincidente en `medios_de_contacto`.
  2. `DonanteService.actualizar` reemplazaba la referencia completa de `Persona` en lugar de mutar la entidad gestionada por Hibernate, rompiendo la integridad con herencia `InheritanceType.JOINED`.
- **Solución:**
  - En `DonanteRepository.java` se actualizó la consulta JPQL con `SELECT DISTINCT d` devolviendo `List<Donante>`.
  - En `DonanteService.java`, `registrar(Persona)` verifica primero la existencia del email y delega en `actualizar(email, persona)`, modificando los campos sobre la instancia administrada (`PersonaHumana` o `PersonaJuridica`).

### 2.3. Separación de Canal Preferido vs. Correo Electrónico Identificador
- **Problema:** Al elegir `WHATSAPP` o `SMS` como medio de contacto preferido, `medioPredeterminado.valor` guardaba el número telefónico. Al abrir el modal de edición, el campo de Correo Electrónico leía `medioPredeterminado.valor` y mostraba el teléfono en vez del email.
- **Solución:** Se crearon los selectores `getDonanteEmail` y `getDonanteTelefono` en `donanteUtils.ts`, que extraen el correo específicamente de la lista `EMAIL` y el teléfono de `SMS`/`WHATSAPP`, independientemente de cuál sea el canal preferido.

### 2.4. Normalización de Domicilio y Eliminación de Código Postal
- **Problema:** El backend serializaba `calle1` y `departamento` en `Direccion`, mientras que el frontend leía `calle` y `depto`, mostrando `undefined` en la tabla.
- **Solución:** Se agregaron `@JsonAlias({"calle", "calle1"})` y `@JsonAlias({"depto", "departamento"})` en `DireccionRequest.java`, getters de compatibilidad en `Direccion.java`, y se quitó el campo Código Postal del formulario manual y de edición por no pertenecer al modelo del dominio.

### 2.5. Corrección del Listado de Supervisores en `servicio-iam`
- **Problema:** `UserController.getSupervisores()` ejecutaba `userRepository.findAll()` y fallaba con `IllegalArgumentException: No enum constant iam.enums.Role.DONANTE` cuando Hibernate encontraba filas con rol `DONANTE` en la tabla `users`.
- **Solución:** Se agregó `DONANTE` al enum `iam.enums.Role` y se optimizó `UserController.getSupervisores()` para filtrar directamente en SQL mediante `userRepository.findByRole(Role.SUPERVISOR)`.

---

## 3. Ingeniería de Rendimiento: Escalamiento a 20.000 Donantes

| Operación | Antes | Después | Solución Técnica |
| :--- | :--- | :--- | :--- |
| **`DonantesInactivosCron`** | 27,8 s cada minuto | **0,089 s (89 ms)** | Consulta JPQL `findDonantesInactivos` filtrando `fechaUltimaInteraccion < :fechaLimite` en SQL |
| **`GET /donantes` (20.000 filas)** | > 30 s + Timeout (20.001 queries N+1) | **2 consultas SQL** | `LEFT JOIN FETCH` en repositorio + `@Fetch(FetchMode.SUBSELECT)` en colecciones `@OneToMany` |
| **Renderizado en `List.tsx`** | Congelamiento del DOM (~300k nodos) | **Instantáneo** | Paginación de 50 filas por página + filtrado `useMemo` en memoria |
| **Importación CSV (20.000 filas)** | ~428 filas en 120 s | **Segundos por lote** | Comprobación local `O(1)` + Pool BCrypt paralelo + `JdbcTemplate.batchUpdate` con `rewriteBatchedStatements=true` |

### Puntos Clave para Explicar la Optimización del CSV
1. **De 20.000 `SELECT` a 1 sola consulta en memoria:** Antes, `ImportadorCargaMasiva` ejecutaba `donanteRepository.find(email)` por cada fila del CSV contra TiDB Cloud en AWS Brasil. Ahora realiza **un único `SELECT` inicial** que carga los emails e IDs existentes en un `HashMap` en memoria (`O(1)`).
2. **Pre-cálculo paralelo de hashes `BCrypt`:** Hashear 20.000 contraseñas en serie con `BCrypt` factor 10 tomaba ~26 minutos de CPU (~80 ms por fila). Ahora se pre-calcula en paralelo un pool de 64 hashes con `IntStream.range(0, 64).parallel()` en ~150 ms.
3. **Inserción y actualización masiva por lotes (`JdbcTemplate` + `rewriteBatchedStatements=true`):** Se reemplazó el `save()` individual por inserciones multi-fila y `batchUpdate` en bloques de 1.000 registros.
4. **Pre-validación local y envío por lotes en el Frontend:** `CsvImportCard.tsx` y `donantesStore.ts` depuran duplicados internos del CSV en el navegador, clasifican cuáles filas son altas nuevas y cuáles actualizaciones, y envían lotes de 2.500 registros mostrando el progreso real sin falsear resultados en memoria si ocurre un corte de red.

