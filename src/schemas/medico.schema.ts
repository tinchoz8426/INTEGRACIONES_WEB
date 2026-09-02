import { z } from 'zod';
import { especialidadSchema } from './common.schema.js';

export const medicoCreateSchema = z
  .object({
    id: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]),
    nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
    matricula: z.union([z.string().trim().min(1), z.number().int().positive()]),
    especialidad: especialidadSchema,
    telefono: z.union([z.string().trim().min(1), z.number()]).optional(),
    email: z.string().trim().email('Email inválido.').optional(),
    activo: z.boolean().optional(),
  })
  .strict();

export const medicoUpdateSchema = medicoCreateSchema.partial();

export const medicoQuerySchema = z
  .object({
    especialidad: z.string().trim().optional(),
    disponible: z.enum(['true', 'false']).optional(),
  })
  .strict();
