import { z } from 'zod';
import { especialidadSchema } from './common.schema.js';

export const turnoCreateSchema = z
  .object({
    id: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]),
    paciente: z.string().trim().min(1, 'El paciente es obligatorio.'),
    documento: z
      .union([
        z.string().trim().min(1, 'El documento es obligatorio.'),
        z.number(),
      ])
      .transform((v) => String(v).trim()),
    especialidad: especialidadSchema,
    fecha: z.string().trim().min(1, 'La fecha es obligatoria.'),
    hora: z.string().trim().min(1, 'La hora es obligatoria.'),
    confirmado: z.union([
      z.boolean(),
      z.enum(['si', 'sí', 'no', 'true', 'false', '1', '0']),
    ]),
    medicoId: z.number().int().positive().optional(),
    pacienteId: z.number().int().positive().optional(),
    observaciones: z.string().trim().optional(),
  })
  .strict();

export const turnoUpdateSchema = turnoCreateSchema.partial();

export const turnoQuerySchema = z
  .object({
    especialidad: z.string().trim().optional(),
    fecha: z.string().trim().optional(),
    medicoId: z
      .string()
      .trim()
      .regex(/^\d+$/, 'medicoId debe ser un número válido.')
      .optional(),
  })
  .strict();
