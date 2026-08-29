# TurnosRed - Backend de Gestión de Turnos Médicos

Sistema backend centralizado desarrollado con **Node.js**, **TypeScript**, **Express** y **Socket.IO** para la normalización y gestión en tiempo real de turnos ambulatorios.

## Requisitos Previos

- **Node.js**: v20.x o superior (LTS)
- **NVM** (Node Version Manager)
- **npm**: v10.x o superior

## Instalación

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

## Scripts Disponibles

- `npm run dev`: Ejecuta la aplicación en modo desarrollo con recarga automática.
- `npm run build`: Compila el código TypeScript a JavaScript en el directorio `dist/`.
- `npm start`: Ejecuta el código compilado desde `dist/index.js`.
- `npm run lint`: Ejecuta ESLint sobre los archivos de código fuente.
- `npm run format`: Formatea el código fuente utilizando Prettier.

## Variables de Entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto en el que escucha el servidor HTTP/WebSockets | `3000` |
| `DATA_PATH` | Ruta relativa al archivo de datos iniciales JSON | `./src/data/turnos.json` |

## Estructura de Carpetas

```text
src/
├── config/       # Variables de entorno y configuración general
├── controllers/  # Controladores HTTP de Express
├── data/         # Archivos de datos crudos (JSON)
├── events/       # Instancia e integración de EventEmitter
├── models/       # Interfaces TypeScript y funciones de normalización
├── routes/       # Definición de endpoints REST
├── services/     # Lógica de negocio e interacción con datos
├── utils/        # Módulos auxiliares y demostrativos
└── index.ts      # Punto de entrada y servidor Socket.IO
```

---

## Paso 6: Guía para Elaborar el Informe Técnico (PDF)

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
| `DELETE` | `/turnos/102` | `200 OK` |

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