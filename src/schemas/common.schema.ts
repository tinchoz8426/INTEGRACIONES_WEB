import { z } from 'zod';

export const ESPECIALIDADES_VALIDAS = [
  'Clínica Médica',
  'Pediatría',
  'Odontología',
  'Nutrición',
  'Cardiología',
  'Traumatología',
];

export const especialidadSchema = z
  .string()
  .min(1, 'La especialidad es obligatoria.')
  .refine(
    (v) =>
      /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*$/.test(v.trim()),
    'La especialidad debe estar en formato Title Case (ej. "Clínica médica", "Pediatría").'
  );
