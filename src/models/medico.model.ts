import { aTitleCase } from './turno.model.js';

export interface MedicoCrudo {
  id: string | number;
  nombre: string;
  matricula: string | number;
  especialidad: string;
  telefono?: string | number;
  email?: string;
  activo?: boolean;
}

export interface Medico {
  id: number;
  nombre: string;
  matricula: string;
  especialidad: string;
  telefono?: string;
  email?: string;
  activo: boolean;
}

export function normalizarMedico(crudo: Partial<MedicoCrudo>): Medico | null {
  try {
    const idNum = Number(crudo.id);
    if (isNaN(idNum) || idNum <= 0 || !Number.isInteger(idNum)) {
      return null;
    }

    if (!crudo.nombre || !crudo.matricula || !crudo.especialidad) {
      return null;
    }

    const nombreSanitizado = String(crudo.nombre).trim();
    const matriculaSanitizada = String(crudo.matricula).trim();
    const especialidadSanitizada = aTitleCase(String(crudo.especialidad));

    return {
      id: idNum,
      nombre: nombreSanitizado,
      matricula: matriculaSanitizada,
      especialidad: especialidadSanitizada,
      ...(crudo.telefono ? { telefono: String(crudo.telefono).trim() } : {}),
      ...(crudo.email ? { email: String(crudo.email).trim() } : {}),
      activo: crudo.activo !== false,
    };
  } catch {
    return null;
  }
}
