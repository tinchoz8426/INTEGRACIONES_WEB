# TurnosRed — Backend de Gestión de Turnos Médicos

Sistema backend centralizado desarrollado con **Node.js**, **TypeScript**, **Express** y **Socket.IO** para la normalización y gestión en tiempo real de turnos ambulatorios y médicos, organizado bajo los principios de **Clean Architecture** (controladores por entidad).

---

## Tabla de contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación y Ejecución](#instalación-y-ejecución)
3. [Variables de Entorno](#variables-de-entorno)
4. [Arquitectura (Clean Architecture)](#arquitectura-clean-architecture)
5. [Documentación de la API REST](#documentación-de-la-api-rest)
6. [Formato Estándar de Errores](#formato-estándar-de-errores)
7. [Normalización de Datos](#normalización-de-datos)
8. [Módulo Pacientes y Turnos (Mockup)](#módulo-pacientes-y-turnos-mockup)
9. [Pruebas con Postman (Variables de Entorno)](#pruebas-con-postman-variables-de-entorno)
10. [Reporte de uso de Inteligencia Artificial](#reporte-de-uso-de-inteligencia-artificial-ia)

---

## Requisitos Previos

| Requisito | Versión recomendada |
|---|---|
| **Node.js** | v20.x o superior (LTS) |
| **npm** | v10.x o superior |
| **NVM** (opcional) | Para gestionar la versión de Node |

---

## Instalación y Ejecución

Siga estos pasos para ejecutar el proyecto en desarrollo:

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd turnos-red

# 2. (Opcional) Seleccionar la versión de Node definida en el proyecto
nvm use

# 3. Instalar dependencias
npm install

# 4. Configurar variables de entorno
cp .env.example .env
```

Luego puede ejecutar el server con `npm run dev` (recomendado en desarrollo):

```bash
npm run dev
```

El servidor levanta en `http://localhost:3000`, carga los datos iniciales desde los archivos JSON
(reportando en consola los registros aceptados y rechazados) y queda listo para recibir peticiones.

| Comando | Descripción |
|---|---|
| `npm run dev` | Modo desarrollo con recarga automática |
| `npm run build` | Compila TypeScript a JavaScript en `dist/` |
| `npm start` | Ejecuta el código compilado (`dist/index.js`) |
| `npm run lint` | Ejecuta ESLint sobre `src/` |
| `npm run format` | Formatea el código fuente con Prettier |

---

## Variables de Entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto en el que escucha el servidor HTTP/WebSockets | `3000` |
| `DATA_PATH` | Ruta al archivo de datos de turnos | `./src/data/turnos.json` |
| `MEDICOS_PATH` | Ruta al archivo de datos de médicos | `./src/data/medicos.json` |

---

## Arquitectura (Clean Architecture)

La lógica de cada endpoint está **desacoplada de las rutas** y delegada a controladores asíncronos.

```text
src/
├── config/       # Variables de entorno
├── controllers/  # Controladores HTTP (por entidad + general)
├── data/         # Datos crudos (JSON)
├── events/       # EventEmitter (bridge Socket.IO)
├── middlewares/  # errorHandler y validación (Zod)
├── models/       # Interfaces TypeScript y normalización
├── routes/       # Definición de rutas delgadas
├── schemas/      # Esquemas de validación Zod
├── services/     # Lógica de negocio + persistencia en memoria
├── utils/        # AppError, httpError, helpers de texto
└── index.ts      # Punto de entrada + Socket.IO
```

### Patrón de controlador

Cada controlador exporta funciones **asíncronas** `async (req, res)` con:

1. Variable de estado `status` al inicio (camino feliz → `200`/`201`/`204`).
2. **Validaciones previas** antes de tocar datos; si fallan, `throw new Error(...)` con código de estado (`httpError`).
3. **Retorno anticipado**: `return res.status(status).json(...)` en toda respuesta (evita `headers already sent`).
4. **`try-catch`** que captura validaciones propias y fallos inesperados, devolviendo siempre `{ status, message, code, details }`.

---

## Documentación de la API REST

**Base URL:** `http://localhost:3000`

> En Postman/Thunder Client la base url se parametriza con la variable **`{{baseUrl}}`** (ver [Pruebas con Postman](#pruebas-con-postman-variables-de-entorno)).

### 1. `GET /` — Bienvenida

- **Descripción**: endpoint de apertura; devuelve un mensaje de bienvenida y la lista de endpoints disponibles. Lo gestiona el **controller general** (`helloWorld`).
- **Respuestas**:

| Código | Escenario | Estructura |
|---|---|---|
| `200` | Éxito | `{ message, endpoints, timestamp }` |

```json
{
  "message": "¡Bienvenido a la API TurnosRed!",
  "endpoints": ["GET  /", "GET  /turnos", "POST /turnos", "GET  /medicos", "..."],
  "timestamp": "2026-09-15T03:25:36.043Z"
}
```

---

### Recurso Turnos — `/turnos`

#### 2.1 `GET /turnos` — Listar turnos

- **Descripción**: devuelve la lista de turnos, opcionalmente filtrada por query params.
- **Query Params** (todos opcionales):

| Parámetro | Tipo | Descripción | Ejemplo |
|---|---|---|---|
| `especialidad` | `string` | Filtra por especialidad (insensible a mayúsculas/acentos) | `?especialidad=Pediatria` |
| `fecha` | `string` | Filtra por fecha exacta (`dd/mm/aaaa`) | `?fecha=14/08/2026` |
| `medicoId` | `number` | Filtra por médico asignado | `?medicoId=202` |

- **Respuestas**:

| Código | Escenario | Estructura |
|---|---|---|
| `200` | Lista de turnos normalizados | `Turno[]` |
| `400` | Query params inválidos | `{ status, message, code: "VALIDATION_ERROR", details }` |

```text
GET http://localhost:3000/turnos?especialidad=Pediatria&fecha=14/08/2026
```

```json
[
  {
    "id": 102,
    "paciente": "Carlos Ruiz",
    "documento": "31654210",
    "especialidad": "Pediatría",
    "fecha": "14/08/2026",
    "hora": "10:00",
    "confirmado": true,
    "medicoId": 201
  }
]
```

#### 2.2 `GET /turnos/:id` — Obtener turno por ID

- **Parámetros**: `id` (path) — número entero positivo.
- **Respuestas**:

| Código | Escenario | Estructura |
|---|---|---|
| `200` | Turno encontrado | `Turno` |
| `400` | `id` no numérico o no positivo | `{ status, message, code: "INVALID_ID", details }` |
| `404` | Turno inexistente | `{ status, message, code: "NOT_FOUND", details }` |

```text
GET http://localhost:3000/turnos/102
```

```json
{
  "id": 102,
  "paciente": "Carlos Ruiz",
  "documento": "31654210",
  "especialidad": "Pediatría",
  "fecha": "14/08/2026",
  "hora": "10:00",
  "confirmado": true,
  "medicoId": 201
}
```

#### 2.3 `POST /turnos` — Crear turno

- **Body (JSON)** — esquema `turnoCreateSchema` (Zod, estricto):

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | `number` \| `string` numérica | ✅ | Identificador del turno |
| `paciente` | `string` | ✅ | Nombre del paciente |
| `documento` | `string` \| `number` | ✅ | Documento (se normaliza a `string`) |
| `especialidad` | `string` | ✅ | Title Case (ej. `"Nutrición"`) |
| `fecha` | `string` | ✅ | Fecha del turno `dd/mm/aaaa` |
| `hora` | `string` | ✅ | Hora (acepta `9.30` → `9:30`) |
| `confirmado` | `boolean` \| `"si"/"no"` | ✅ | Estado de confirmación |
| `medicoId` | `number` | ⬜ | Médico asignado |
| `observaciones` | `string` | ⬜ | Notas complementarias |

- **Respuestas**:

| Código | Escenario | Estructura |
|---|---|---|
| `201` | Turno creado | `Turno` normalizado |
| `400` | Cuerpo inválido / id inválido | `{ status, message, code: "VALIDATION_ERROR" \| "INVALID_ID", details }` |
| `409` | ID duplicado | `{ status, message, code: "CONFLICT", details }` |

```json
{
  "id": 8001,
  "paciente": "Lucía Fernández",
  "documento": "AB-4567 / 2026",
  "especialidad": "Nutrición",
  "fecha": "16/08/2026",
  "hora": "9.30",
  "confirmado": "si",
  "medicoId": 201
}
```

#### 2.4 `PUT /turnos/:id` — Actualizar turno

- **Descripción**: actualiza parcialmente un turno (merge). Body: cualquier subconjunto de campos del esquema de creación.
- **Respuestas**: `200` (turno actualizado) · `400` (`INVALID_ID` / `VALIDATION_ERROR`) · `404` (no encontrado).

```json
{
  "paciente": "Carlos Ruiz Gómez",
  "confirmado": true
}
```

#### 2.5 `DELETE /turnos/:id` — Eliminar turno

- **Respuestas**: `204` (sin cuerpo) · `400` (`INVALID_ID`) · `404` (no encontrado).

---

### Recurso Médicos — `/medicos`

#### 3.1 `GET /medicos` — Listar médicos

- **Query Params** (opcionales):

| Parámetro | Tipo | Descripción | Ejemplo |
|---|---|---|---|
| `especialidad` | `string` | Filtra por especialidad (insensible a acentos) | `?especialidad=Odontologia` |
| `disponible` | `boolean` | Filtra por disponibilidad (`true`/`false`) | `?disponible=true` |

- **Respuestas**: `200` (`Medico[]`) · `400` (query inválidos).

```text
GET http://localhost:3000/medicos?especialidad=Odontologia&disponible=true
```

```json
[
  {
    "id": 203,
    "nombre": "Dra. Silvia Rodriguez",
    "matricula": "MN 24680",
    "especialidad": "Odontología",
    "telefono": "11-5555-0404",
    "email": "silvia.rodriguez@hospital.com",
    "activo": false
  }
]
```

#### 3.2 `GET /medicos/:id` — Obtener médico por ID

- **Respuestas**: `200` (`Medico`) · `400` (`INVALID_ID`) · `404` (`NOT_FOUND`).

#### 3.3 `POST /medicos` — Registrar médico

- **Body (JSON)** — esquema `medicoCreateSchema` (Zod, estricto):

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | `number` \| `string` numérica | ✅ | Identificador |
| `nombre` | `string` | ✅ | Nombre completo |
| `matricula` | `string` \| `number` | ✅ | Matrícula profesional |
| `especialidad` | `string` | ✅ | Title Case (ej. `"Cardiología"`) |
| `telefono` | `string` \| `number` | ⬜ | Teléfono |
| `email` | `string` | ⬜ | Email (validado) |
| `activo` | `boolean` | ⬜ | Alta / baja (default `true`) |

- **Respuestas**: `201` (`Medico`) · `400` (`VALIDATION_ERROR`/`INVALID_ID`) · `409` (`CONFLICT`).

```json
{
  "id": 9001,
  "nombre": "Dra. María Gómez",
  "matricula": "MN 13579",
  "especialidad": "Cardiología",
  "telefono": "11-5555-0606",
  "email": "maria.gomez@hospital.com",
  "activo": true
}
```

#### 3.4 `PUT /medicos/:id` — Actualizar médico

- **Respuestas**: `200` · `400` (`INVALID_ID`/`VALIDATION_ERROR`) · `404`.

```json
{
  "activo": false,
  "telefono": "11-5555-0101"
}
```

#### 3.5 `DELETE /medicos/:id` — Dar de baja médico

- **Respuestas**: `204` (sin cuerpo) · `400` (`INVALID_ID`) · `404`.

---

## Recurso Pacientes — `/pacientes`

CRUD completo del nuevo módulo de Pacientes, más el endpoint relacional de turnos del paciente.
La relación se resuelve por `pacienteId` cuando el turno lo referencia, o por coincidencia de `documento` del turno
con el `dni` del paciente. Módulo implementado según la propuesta de [`pacientes-turnos.md`](./pacientes-turnos.md).

#### 4.1 `GET /pacientes` — Listar pacientes

- **Descripción**: devuelve todos los pacientes registrados.
- **Query (opcional)**: `apellido` para filtrar por apellido exacto.
- **Respuestas**: `200` (array de pacientes, vacío si no hay).

#### 4.2 `GET /pacientes/:id` — Obtener paciente por ID

- **Respuestas**: `200` (paciente) · `400` (`INVALID_ID`) · `404`.

#### 4.3 `GET /pacientes/:id/turnos` — Turnos de un paciente

- **Respuestas**: `200` (array de turnos del paciente) · `400` (`INVALID_ID`) · `404`
  (si el paciente no existe).

#### 4.4 `POST /pacientes` — Registrar paciente

- **Body requerido**: `id` (entero positivo), `dni`, `nombre`, `apellido`, `fechaNacimiento`, `telefono`.
- **Body opcional**: `email`, `direccion`, `obraSocial`.
- **Respuestas**: `201` (paciente creado) · `400` (`VALIDATION_ERROR`) · `409`
  (`CONFLICT` si el `id` o el `dni` ya existen).

#### 4.5 `PUT /pacientes/:id` — Actualizar paciente

- **Respuestas**: `200` (paciente actualizado) · `400` (`INVALID_ID`) · `404` · `409`
  (`CONFLICT` si el `dni` ya lo usa otro paciente).

#### 4.6 `DELETE /pacientes/:id` — Dar de baja paciente

- **Respuestas**: `204` (sin cuerpo) · `400` (`INVALID_ID`) · `404`.

---

## Formato Estándar de Errores

Todas las respuestas fallidas usan una estructura JSON uniforme:

```json
{
  "status": 404,
  "message": "Turno no encontrado.",
  "code": "NOT_FOUND",
  "details": []
}
```

| Código de error | Significado | Status HTTP |
|---|---|---|
| `VALIDATION_ERROR` | Fallo de validación de campos (Zod) | `400` |
| `BAD_REQUEST` | Solicitud mal formada | `400` |
| `INVALID_ID` | ID de recurso inválido (no numérico / no positivo) | `400` |
| `NOT_FOUND` | Recurso no encontrado | `404` |
| `CONFLICT` | ID duplicado al crear | `409` |
| `INTERNAL_SERVER_ERROR` | Error interno del servidor | `500` |

---

## Normalización de Datos

- `documento` se almacena como `string` (formatos flexibles como `"AB-4567"`).
- `especialidad` se normaliza a **Title Case** (`"CLÍNICA MÉDICA"` → `"Clínica Médica"`); la entrada exige ese formato.
- `confirmado` se convierte de `"si"`/`"no"` a `boolean`.
- `hora` se normaliza de `"."` a `":"` (`"9.30"` → `"9:30"`).
- Los filtros por especialidad son insensibles a mayúsculas y acentos (`Pediatria` → `Pediatría`).

---

## Módulo Pacientes y Turnos

Módulo de **Pacientes** y evolución del recurso **Turnos**: el **mockup** completo (modelado de datos,
esquemas Zod, interfaces TypeScript y los 2 endpoints restantes según Clean Architecture) está en:

➡️ **Ver [`pacientes-turnos.md`](./pacientes-turnos.md)**

> ✅ **Implementado**: el módulo `/pacientes` ya está desarrollado en código (ver
> [Recurso Pacientes](#recurso-pacientes--pacientes)), incluido el endpoint relacional
> `GET /pacientes/:id/turnos`.

---

## Pruebas con Postman (Variables de Entorno)

La colección de pruebas centraliza la URL base en la variable **`baseUrl`** a nivel de **Environment** y la usa en **todas** las peticiones (68 referencias; no existen URLs duras).

- `postman/TurnosRed.postman_collection.json`
- `postman/TurnosRed.postman_environment.json`

### Importación

1. **Postman → Import** → seleccionar ambos archivos.
2. En la esquina superior derecha, activar el environment **`turnosRedEnvi`**.
3. Verificar el valor de la variable `baseUrl`:

| Variable | Valor |
|---|---|
| `baseUrl` | `http://localhost:3000` |

> Para apuntar a otro servidor (p. ej. mock), **solo** hay que editar la variable `baseUrl` del environment: no es necesario tocar ninguna petición.

### Ejecución automatizada (Newman)

```bash
npx newman run postman/TurnosRed.postman_collection.json -e postman/TurnosRed.postman_environment.json
```

Resultado verificado: **16 peticiones · 52 aserciones · 0 fallos** (52/52 PASS).

---

## Reporte de uso de Inteligencia Artificial (IA)

Durante el desarrollo se utilizaron herramientas de IA generativa para asistir en la generación de código, la corrección de tipos y la elaboración de documentación.

| Tarea | Herramienta | Prompt | Respuesta generada | Ajuste manual aplicado |
|---|---|---|---|---|
| Schema de validación Zod | ChatGPT / Gemini | *"Genera un esquema Zod para validar un recurso médico y otro de turnos, con documento como string flexible, id numérico positivo y especialidad en formato 'Clínica Médica' (Title Case)."* | Código de `src/schemas/turno.schema.ts` y `src/schemas/medico.schema.ts` con `z.object().strict()`. | Validación de Title Case movida a helper reutilizable (`src/schemas/common.schema.ts`) y `.transform()` para `documento`. |
| Validación y manejo de errores estándar | ChatGPT / Gemini | *"Crea un middleware de manejo de errores que devuelva respuestas con estructura { status, message, code, details }."* | Código de `middlewares/errorHandler.ts` y `utils/AppError.ts`. | Se añadió `notFoundHandler` para rutas inexistentes y soporte de `ErrorConEstado`. |
| Normalización de especialidad | ChatGPT / Gemini | *"Normaliza la especialidad a Title Case en Node.js (cada palabra empieza en mayúscula)."* | Expresión regular con `String.replace()` para capitalizar palabras. | Se usó `(\p{L})` con Unicode flag para soportar tildes y caracteres acentuados. |
| Filtros por query params | ChatGPT / Gemini | *"Implementa filtros por especialidad, fecha y medicoId en el servicio de Turnos sin crear nuevos endpoints."* | Método `obtenerTodos(filtros)` con `Array.filter`. | Comparación insensible a acentos (`src/utils/text.ts`, `sinDiacriticos`). |
| CRUD del recurso Médico | ChatGPT / Gemini | *"Desarrolla el CRUD completo de /medicos siguiendo la misma arquitectura en capas de /turnos."* | Capas completas para `medico` (model, service, controller, routes, data). | Se integró el bridge `appEvents` y `MEDICOS_PATH` en `config/env.ts`. |
| Colección Postman | ChatGPT / Gemini | *"Genera una colección Postman con variables de entorno, tests automatizados y respuestas guardadas."* | Colección `TurnosRed.postman_collection.json` + environment. | Se centralizó la URL en `{{baseUrl}}` y se ampliaron los rangos de IDs dinámicos. |
| Refactor Clean Architecture (Controllers) | ChatGPT / Gemini | *"Refactoriza los handlers hacia controladores async con variable de estado, validaciones previas, throw new Error con código de estado, try-catch y return explícito; crea un controller general de bienvenida y 404."* | Controladores asíncronos con `status`/`try-catch`/`return`; `general.controller.ts` (bienvenida + 404) y `utils/httpError.ts`. | Se conservó el formato de error exigido por Newman y se adaptó `req.params.id` a Express 5. |
| Mockup módulo Pacientes y Turnos | ChatGPT / Gemini | *"Diseña la propuesta conceptual y técnica (modelado, esquemas y endpoints RESTful) para el módulo de pacientes y turnos según Clean Architecture."* | Documento `pacientes-turnos.md` con tablas de campos, interfaces TS, esquemas Zod y 2 endpoints. | Se verificaron campos contra esquemas reales del proyecto y respondéformato de `fechaNacimiento`. |
| Implementación módulo Pacientes | ChatGPT / Gemini | *"Implementa el módulo /pacientes siguiendo la misma arquitectura en capas del proyecto (model, schema, service, controller, routes)."* | Capas completas de `paciente` + `GET /pacientes/:id/turnos`. | Se añadió `pacienteId` opcional al modelo Turno y consulta relacional por DNI; seed en `src/data/pacientes.json`. |
| Documentación técnica integral | ChatGPT / Gemini | *"Genera la documentación completa de la API REST en README: método/path, descripción, params/body, respuestas y códigos, e instalación paso a paso."* | README.md reorganizado con documentación por endpoint y sección de variables `{{baseUrl}}`. | Cada ejemplo fue verificado contra la ejecución real del servidor y contra las schemas Zod. |

---

## Guía para Elaborar el Informe Técnico (PDF)

Para completar los requisitos de la entrega en PDF (**máximo 5 páginas**), se recomienda:

### 1. Captura de Depuración (Debugging) en VS Code

1. Abrir **Run and Debug**.
2. Colocar un *breakpoint* en `src/controllers/turno.controller.ts` (función `getTurnos`).
3. Ejecutar el debugger con `ts-node-dev`.
4. Realizar `GET http://localhost:3000/turnos`.
5. Capturar el panel **Variables** + la línea en ejecución.

### 2. Capturas de Pruebas (5 Endpoints)

| Método | Endpoint | Resultado esperado |
|---|---|---|
| `GET` | `/turnos` | `200 OK` |
| `GET` | `/turnos/102` | `200 OK` |
| `GET` | `/turnos/{id-inexistente}` | `404 Not Found` |
| `POST` | `/turnos` | `201 Created` |
| `PUT` | `/turnos/102` | `200 OK` |
| `DELETE` | `/turnos/102` | `204 No Content` |

En `POST` y `PUT`, la captura debe mostrar el **body JSON** y la respuesta.

### 3. Evidencia en Tiempo Real (Socket.IO)

Conectarse a `http://localhost:3000` desde un cliente Socket.IO, ejecutar un `POST`/`PUT` sobre la API y verificar que se recibe el evento (`turno:nuevo`, `turno:actualizado` o `turno:eliminado`).