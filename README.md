# TurnosRed - Backend de Gestión de Turnos Médicos

Sistema backend centralizado desarrollado con **Node.js**, **TypeScript**, **Express** y **Socket.IO** para la normalización y gestión en tiempo real de turnos ambulatorios y médicos.

## Requisitos Previos

- **Node.js**: v20.x o superior (LTS)
- **NVM** (Node Version Manager)
- **npm**: v10.x o superior

## Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd turnos-red
```

### 2. Seleccionar la versión de Node mediante NVM

```bash
nvm use
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Configurar variables de entorno

Copiar `.env.example` a `.env`:

```bash
cp .env.example .env
```

### 5. Ejecutar

| Comando | Descripción |
|---|---|
| `npm run dev` | Modo desarrollo con recarga automática (ts-node-dev). |
| `npm run build` | Compila TypeScript a JavaScript en `dist/`. |
| `npm start` | Ejecuta el código compilado (`dist/index.js`). |
| `npm run lint` | Ejecuta ESLint sobre `src/`. |
| `npm run format` | Formatea el código fuente con Prettier. |

Al iniciar, el servidor carga los datos iniciales desde los archivos JSON (reportando registros aceptados y rechazados) y comienza a escuchar en el puerto configurado.

## Variables de Entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto en el que escucha el servidor HTTP/WebSockets | `3000` |
| `DATA_PATH` | Ruta relativa al archivo de datos iniciales de turnos | `./src/data/turnos.json` |
| `MEDICOS_PATH` | Ruta relativa al archivo de datos iniciales de médicos | `./src/data/medicos.json` |

## Estructura de Carpetas

```text
src/
├── config/       # Variables de entorno y configuración general
├── controllers/  # Controladores HTTP de Express
├── data/         # Archivos de datos crudos (JSON)
├── events/       # Instancia e integración de EventEmitter
├── middlewares/  # Manejo de errores y validación (Zod)
├── models/       # Interfaces TypeScript y funciones de normalización
├── routes/       # Definición de endpoints REST
├── schemas/      # Esquemas de validación Zod
├── services/     # Lógica de negocio e interacción con datos
├── utils/        # Módulos auxiliares (AppError, helpers de texto)
└── index.ts      # Punto de entrada y servidor Socket.IO
```

## Endpoints

Base URL: `http://localhost:3000`

### Recurso Turnos (`/turnos`)

| Método | Ruta | Descripción | Códigos de éxito |
|---|---|---|---|
| `GET` | `/turnos` | Lista todos los turnos (con filtros opcionales) | `200` |
| `GET` | `/turnos/:id` | Consulta un turno por identificador | `200` |
| `POST` | `/turnos` | Crea un nuevo turno | `201` |
| `PUT` | `/turnos/:id` | Actualiza la información de un turno | `200` |
| `DELETE` | `/turnos/:id` | Elimina un turno | `204` |

#### Ejemplos de Query Params (GET /turnos)

| Parámetro | Tipo | Descripción | Ejemplo |
|---|---|---|---|
| `especialidad` | `string` | Filtra por especialidad (insensible a mayúsculas/acentos) | `?especialidad=Pediatria` |
| `fecha` | `string` | Filtra por fecha exacta (formato `dd/mm/aaaa`) | `?fecha=14/08/2026` |
| `medicoId` | `number` | Filtra por identificador de médico asignado | `?medicoId=201` |

```text
GET /turnos?especialidad=Pediatria&fecha=14/08/2026
GET /turnos?medicoId=202
```

**Cuerpo de ejemplo (POST /turnos):**

```json
{
  "id": 104,
  "paciente": "Lucía Fernández",
  "documento": "AB-4567 / 2026",
  "especialidad": "Nutrición",
  "fecha": "16/08/2026",
  "hora": "9.30",
  "confirmado": "si",
  "medicoId": 201
}
```

### Recurso Médicos (`/medicos`)

| Método | Ruta | Descripción | Códigos de éxito |
|---|---|---|---|
| `GET` | `/medicos` | Lista todos los médicos (con filtros opcionales) | `200` |
| `GET` | `/medicos/:id` | Consulta un médico por identificador | `200` |
| `POST` | `/medicos` | Registra un nuevo médico | `201` |
| `PUT` | `/medicos/:id` | Actualiza la información de un médico | `200` |
| `DELETE` | `/medicos/:id` | Da de baja un médico | `204` |

#### Ejemplos de Query Params (GET /medicos)

| Parámetro | Tipo | Descripción | Ejemplo |
|---|---|---|---|
| `especialidad` | `string` | Filtra por especialidad (insensible a mayúsculas/acentos) | `?especialidad=Odontologia` |
| `disponible` | `boolean` | Filtra por disponibilidad (`true`/`false`) | `?disponible=true` |

```text
GET /medicos?especialidad=Odontologia&disponible=true
GET /medicos?disponible=false
```

**Cuerpo de ejemplo (POST /medicos):**

```json
{
  "id": 401,
  "nombre": "Dra. María Gómez",
  "matricula": "MN 13579",
  "especialidad": "Cardiología",
  "telefono": "11-5555-0606",
  "email": "maria.gomez@hospital.com",
  "activo": true
}
```

### Formato estándar de errores

Todas las respuestas fallidas usan una estructura JSON uniforme:

```json
{
  "status": 400,
  "message": "Error de validación en los datos ingresados.",
  "code": "VALIDATION_ERROR",
  "details": []
}
```

| Código de error | Significado | Status HTTP |
|---|---|---|
| `VALIDATION_ERROR` | Fallo de validación de campos (Zod) | `400` |
| `BAD_REQUEST` | Solicitud mal formada | `400` |
| `NOT_FOUND` | Recurso no encontrado / ruta inexistente | `404` |
| `CONFLICT` | ID duplicado al crear | `409` |
| `INTERNAL_SERVER_ERROR` | Error interno del servidor | `500` |

### Normalización de datos

- `documento` se almacena como `string` (admitiendo formatos flexibles como `"AB-4567"`).
- `especialidad` se normaliza a **Title Case / PascalCase** (p. ej. `"CLÍNICA MÉDICA"` → `"Clínica Médica"`). La validación de entrada (POST/PUT) exige este formato.
- `confirmado` se convierte de `"si"`/`"no"` a booleano.
- `hora` se normaliza de `"."` a `":"` (p. ej. `"9.30"` → `"9:30"`).

## Pruebas con Postman

Se incluye una colección completa con variables de entorno, scripts de test automatizados (códigos de estado y esquema JSON), escenarios Happy Path y casos borde, y respuestas guardadas para simular la API con Postman Mock Server:

- `postman/TurnosRed.postman_collection.json`
- `postman/TurnosRed.postman_environment.json`

Importación: **Postman → Import → seleccionar ambos archivos**.

---

## Reporte de uso de Inteligencia Artificial (IA)

Durante el desarrollo del proyecto se utilizaron herramientas de IA generativa para asistir en la generación de código, la corrección de tipos y la elaboración de documentación. A continuación se detalla el registro de uso:

| Tarea | Herramienta | Prompt | Respuesta generada | Ajuste manual aplicado |
|---|---|---|---|---|
| Schema de validación Zod | ChatGPT / Gemini | *"Genera un esquema Zod para validar un recurso médico y otro de turnos, con documento como string flexible, id numérico positivo y especialidad en formato 'Clínica Médica' (Title Case)."* | Código de `src/schemas/turno.schema.ts` y `src/schemas/medico.schema.ts` con `z.object().strict()`, validación de campos obligatorios y tipos (`string | number`). | Corrección de tipos: se movió la validación de Title Case a un helper reutilizable (`src/schemas/common.schema.ts`) y se aplicó `.transform()` para convertir `documento` a `string`. |
| Validación y manejo de errores estándar | ChatGPT / Gemini | *"Crea un middleware de manejo de errores que devuelva respuestas con estructura { status, message, code, details } y que intercepte errores de Zod."* | Código de `middlewares/errorHandler.ts` y `utils/AppError.ts` con diferenciación de `ZodError`, `AppError` y errores desconocidos. | Ajuste manual: se añadió `notFoundHandler` para rutas inexistentes y se eliminó el uso de variables no utilizadas (`_next`) para cumplir ESLint. |
| Normalización de especialidad | ChatGPT / Gemini | *"Normaliza la especialidad a Title Case en Node.js (cada palabra empieza en mayúscula)."* | Expresión regular con `String.replace()` para capitalizar palabras en `models/turno.model.ts`. | Ajuste manual: se usó `(\p{L})` con Unicode flag sobre `.toLowerCase()` para soportar tildes y caracteres acentuados (p. ej. "Clínica", "Pediatría"). |
| Filtros por query params | ChatGPT / Gemini | *"Implementa filtros por especialidad, fecha y medicoId en el servicio de Turnos sin crear nuevos endpoints."* | Método `obtenerTodos(filtros)` con `Array.filter` en `services/turno.service.ts` y `services/medico.service.ts`. | Ajuste manual: se agregó comparación insensible a acentos (`src/utils/text.ts`, función `sinDiacriticos`) para que `especialidad=Pediatria` encuentre "Pediatría". |
| CRUD del recurso Médico | ChatGPT / Gemini | *"Desarrolla el CRUD completo de /medicos siguiendo la misma arquitectura en capas de /turnos."* | Capas completas: `models/medico.model.ts`, `services/medico.service.ts`, `controllers/medico.controller.ts`, `routes/medico.routes.ts` y datos seed en `data/medicos.json`. | Ajuste manual: se integró el bridge con el patrón existente (`appEvents`), se añadió `MEDICOS_PATH` a `config/env.ts` y se mantuvo la respuesta `204` sin cuerpo en DELETE. |
| Colocación de pulsaciones en Postman | ChatGPT / Gemini | *"Genera una colección Postman con variables de entorno, tests automatizados y respuestas guardadas para simular la API."* | Colección `postman/TurnosRed.postman_collection.json` y ambiente `TurnosRed.postman_environment.json` con scripts de test y ejemplos guardados. | Ajuste manual: se corrigió el acceso a `req.query` (getter ready-only en Express), se ampliaron los rangos de IDs dinámicos para evitar colisiones y se eliminó un helper compartido que no persistía entre requests. |
| Documentación técnica | ChatGPT / Gemini | *"Documenta los endpoints, variables de entorno, estructura de carpetas y ejemplos de query params en el README."* | Borrador de este archivo `README.md` con instalación, tablas de endpoints y formato de errores. | Ajuste manual: se verificó cada ejemplo contra la ejecución real del servidor y se incorporó la sección de "Uso de Inteligencia Artificial" con el detalle de ajustes aplicados. |

---

## Guía para Elaborar el Informe Técnico (PDF)

Para completar los requisitos de la entrega en PDF (**máximo 5 páginas**), toma las capturas de pantalla siguiendo estos pasos.

### 1. Captura de Depuración (Debugging) en VS Code

1. Abre la pestaña **Run and Debug** en VS Code.
2. Pon un punto de interrupción (*breakpoint*) en `src/controllers/turno.controller.ts`, dentro de la función `getTurnos`.
3. Ejecuta el debugger con `ts-node-dev`.
4. Realiza una petición:

```text
GET http://localhost:3000/turnos
```

5. Toma una captura de pantalla mostrando:
   - Las variables disponibles en el panel **Variables**.
   - La línea de código donde se encuentra el *breakpoint*.
   - La ejecución detenida en el punto de interrupción.

### 2. Capturas de Pruebas en Postman (5 Endpoints)

Realiza las siguientes pruebas en Postman:

| Método | Endpoint | Resultado esperado |
|---|---|---|
| `GET` | `/turnos` | `200 OK` |
| `GET` | `/turnos/102` | `200 OK` |
| `GET` | `/turnos/{id-inexistente}` | `404 Not Found` |
| `POST` | `/turnos` | `201 Created` |
| `PUT` | `/turnos/102` | `200 OK` |
| `DELETE` | `/turnos/102` | `204 No Content` |

Para las operaciones `POST` y `PUT`, la captura debe mostrar el **body JSON enviado** y la respuesta obtenida.

### 3. Evidencia de Tiempo Real (Socket.IO)

Puedes utilizar una herramienta como **Postman WebSocket Request** o un HTML simple de prueba para conectarte al servidor Socket.IO.

La prueba debe demostrar que los eventos se reciben en tiempo real.

1. Conecta el cliente Socket.IO al servidor:

```text
http://localhost:3000
```

2. Ejecuta un `POST` o `PUT` sobre la API REST.

3. Verifica que el cliente recibe el evento correspondiente:

```text
turno:nuevo
```

o

```text
turno:actualizado
```

4. Toma una captura de pantalla donde se pueda observar:
   - La conexión del cliente Socket.IO.
   - La operación realizada mediante la API REST.
   - El evento recibido en tiempo real.