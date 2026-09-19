import { z } from 'zod';

export const pacienteCreateSchema = z
  .object({
    id: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]),
    dni: z
      .union([z.string().trim().min(1), z.number()])
      .transform((v) => String(v).trim()),
    nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
    apellido: z.string().trim().min(1, 'El apellido es obligatorio.'),
    fechaNacimiento: z.string().trim().min(1, 'La fecha de nacimiento es obligatoria.'),
    telefono: z
      .union([z.string().trim().min(1), z.number()])
      .transform((v) => String(v).trim()),
    email: z.string().trim().email('Email inválido.').optional(),
    direccion: z.string().trim().optional(),
    obraSocial: z.string().trim().optional(),
  })
  .strict();

export const pacienteUpdateSchema = pacienteCreateSchema.partial();

export const pacienteQuerySchema = z
  .object({
    apellido: z.string().trim().optional(),
  })
  .strict();