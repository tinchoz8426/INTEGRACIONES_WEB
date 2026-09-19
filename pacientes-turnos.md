# Mockup RESTful — Módulo de Pacientes y Turnos

> Propuesta conceptual y técnica elaborada según los principios de **Clean Architecture**.
> Documento de definición de interfaces para el equipo de Frontend (pantalla de gestión de pacientes y asignación de turnos médicos).

> ✅ **Estado: IMPLEMENTADO en código** (`src/` con las capas `model → schema → service → controller → routes`).
> Endpoints 1 y 2 disponibles y verificados con Newman (52/52 PASS sin regresiones).

## 1. Investigación de requerimientos

### 1.1 Datos mínimos para registrar un **Paciente**

Para un sistema de gestión de turnos ambulatorios se identifican como datos mínimos e indispensables:

| Campo | Tipo | Obligatorio | Justificación |
|---|---|---|---|
| `id` | `number` | ✅ | Identificador interno único de la entidad |
| `dni` | `string` | ✅ | Documento nacional (se normaliza como `string` para tolerar formatos flexibles) |
| `nombre` | `string` | ✅ | Primer nombre del paciente |
| `apellido` | `string` | ✅ | Apellido del paciente |
| `fechaNacimiento` | `string` (`dd/mm/aaaa`) | ✅ | Permite validar edad y antecedentes |
| `telefono` | `string` | ✅ | Dato de contacto primario |
| `email` | `string` | ⬜ | Contacto secundario (validado con formato email) |
| `direccion` | `string` | ⬜ | Domicilio del paciente |
| `obraSocial` | `string` | ⬜ | Obra social / cobertura médica |

### 1.2 Datos requeridos para **asignar un Turno Médico**

El turno vincula a un paciente con un profesional en una fecha/hora determinada:

| Campo | Tipo | Obligatorio | Justificación |
|---|---|---|---|
| `id` | `number` | ✅ | Identificador del turno |
| `pacienteId` | `number` | ✅ | **FK** hacia el recurso `Paciente` |
| `medicoId` | `number` | ✅ | **FK** hacia el recurso `Profesional` (Médico) |
| `especialidad` | `string` | ✅ | Se expone de forma denormalizada para facilitar la consulta (formato Title Case) |
| `fecha` | `string` (`dd/mm/aaaa`) | ✅ | Fecha del turno |
| `hora` | `string` (`hh:mm`) | ✅ | Hora del turno |
| `confirmado` | `boolean` | ✅ | Estado de confirmación del turno |
| `observaciones` | `string` | ⬜ | Notas complementarias del profesional |

## 2. Modelado de datos — explicación conceptual

### 2.1 Relación entre entidades

```
Paciente 1 ──── * Turno * ──── 1 Médico (Profesional)
```

- Un **Paciente** puede tener muchos **Turnos**.
- Un **Turno** pertenece a un único **Paciente** (`pacienteId`) y se asigna a un único **Médico** (`medicoId`).
- Con la incorporación del módulo, el recurso `Turno` pasa a referenciar al paciente mediante `pacienteId`
  (en lugar de incrustar `paciente` + `documento` como texto), consolidando la normalización de datos.

### 2.2 Interfaces TypeScript propuestas

```typescript
// src/models/paciente.model.ts
export interface PacienteCrudo {
  id: string | number;
  dni: string | number;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string | number;
  email?: string;
  direccion?: string;
  obraSocial?: string;
}

export interface Paciente {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string;
  email?: string;
  direccion?: string;
  obraSocial?: string;
}
```

```typescript
// src/models/turno.model.ts (evolución propuesta)
export interface TurnoConPaciente {
  id: number;
  pacienteId: number;
  medicoId: number;
  especialidad: string;
  fecha: string;
  hora: string;
  confirmado: boolean;
  observaciones?: string;
}
```

### 2.3 Esquema de validación Zod propuesto

```typescript
// src/schemas/paciente.schema.ts
import { z } from 'zod';

export const pacienteCreateSchema = z
  .object({
    id: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]),
    dni: z.union([z.string().trim().min(1), z.number()]).transform((v) => String(v).trim()),
    nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
    apellido: z.string().trim().min(1, 'El apellido es obligatorio.'),
    fechaNacimiento: z.string().trim().min(1, 'La fecha de nacimiento es obligatoria.'),
    telefono: z.union([z.string().trim().min(1), z.number()]).transform((v) => String(v).trim()),
    email: z.string().trim().email('Email inválido.').optional(),
    direccion: z.string().trim().optional(),
    obraSocial: z.string().trim().optional(),
  })
  .strict();

export const pacienteUpdateSchema = pacienteCreateSchema.partial();
```

## 3. Definición de endpoints RESTful (Clean Architecture)

### 3.1 `POST /pacientes` — Registrar un paciente

- **Descripción funcional**: da de alta un paciente en el sistema. Valida el cuerpo
  con Zod (`pacienteCreateSchema`) antes de llegar al controlador.
- **Cuerpo de entrada (Body JSON):**

```json
{
  "id": 1001,
  "dni": "31.543.210",
  "nombre": "Carlos",
  "apellido": "Ruiz",
  "fechaNacimiento": "12/04/1985",
  "telefono": "11-5555-1234",
  "email": "carlos.ruiz@mail.com",
  "direccion": "Av. Siempre Viva 742",
  "obraSocial": "OSDE 210"
}
```

- **Respuestas:**

| Código | Escenario | Estructura |
|---|---|---|
| `201` | Paciente registrado | Paciente normalizado (JSON) |
| `400` | Cuerpo inválido / campos faltantes | `{ status, message, code: "VALIDATION_ERROR", details }` |
| `400` | Invalida `id` (no numérico) | `{ status, message, code: "INVALID_ID", details }` |
| `409` | `dni` duplicado | `{ status, message, code: "CONFLICT", details }` |
| `500` | Error interno del servidor | `{ status, message, code: "INTERNAL_SERVER_ERROR", details }` |

- **Ejemplo de respuesta `201`:**

```json
{
  "id": 1001,
  "dni": "31.543.210",
  "nombre": "Carlos",
  "apellido": "Ruiz",
  "fechaNacimiento": "12/04/1985",
  "telefono": "11-5555-1234",
  "email": "carlos.ruiz@mail.com",
  "direccion": "Av. Siempre Viva 742",
  "obraSocial": "OSDE 210"
}
```

### 3.2 `GET /pacientes/:id/turnos` — Obtener los turnos de un paciente

- **Descripción funcional**: consulta el historial de turnos asignados a un paciente.
  Permite ver, en la pantalla de gestión, la agenda del paciente.
- **Parámetros:**

| Tipo | Parámetro | Descripción |
|---|---|---|
| Path | `id` | Identificador del paciente (número entero positivo) |

- **Respuestas:**

| Código | Escenario | Estructura |
|---|---|---|
| `200` | Lista de turnos del paciente | `Turno[]` (con `pacienteId`) |
| `400` | `id` no numérico o no positivo | `{ status, message, code: "INVALID_ID", details }` |
| `404` | Paciente inexistente | `{ status, message, code: "NOT_FOUND", details }` |
| `500` | Error interno del servidor | `{ status, message, code: "INTERNAL_SERVER_ERROR", details }` |

- **Ejemplo de respuesta `200`:**

```json
[
  {
    "id": 102,
    "pacienteId": 1001,
    "medicoId": 201,
    "especialidad": "Pediatría",
    "fecha": "14/08/2026",
    "hora": "10:00",
    "confirmado": true
  }
]
```

## 4. Mapa de implementación (Clean Architecture)

La incorporación del módulo sigue la misma separación de responsabilidades ya aplicada en el proyecto:

```text
src/
├── models/        # paciente.model.ts (interfaces + normalizador)
├── schemas/       # paciente.schema.ts (validación Zod)
├── services/      # paciente.service.ts (lógica de negocio / persistencia en memoria)
├── controllers/   # paciente.controller.ts (handlers async + try-catch + status)
├── routes/        # paciente.routes.ts (definición de rutas delgadas)
└── data/          # pacientes.json (datos semilla)
```

Secuencia por endpoint:

1. `routes` → aplican middleware de validación Zod.
2. `controllers` (async) → validación previa de `id`, variable `status`, `try/catch`, `return res.status(status).json(...)`.
3. `services` → manipulan el arreglo en memoria (persistencia ficticia, según nota del equipo de base de datos).
4. `models` → normalizan datos crudos (title case, formatos de documento, booleans).

### Implementación real (adicional a los 2 endpoints)

Además de los 2 endpoints de la propuesta, el CRUD completo quedó disponible en producción:

- `GET /pacientes` · `GET /pacientes/:id` · `PUT /pacientes/:id` · `DELETE /pacientes/:id`.
- Se agregó `pacienteId` **opcional** al modelo y schema de `Turno` para vincular de forma explícita un turno a un paciente (sin romper la compatibilidad del contrato previo).
- `GET /pacientes/:id/turnos` resuelve la relación por `pacienteId` o, en su defecto, por coincidencia de `documento` del turno con el `dni` del paciente (insensible a acentos).
- Semilla inicial: `src/data/pacientes.json` (2 pacientes). Variable de entorno `PACIENTES_PATH` añadida a `.env.example`.