import { aTitleCase } from './turno.model.js';

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

export function normalizarPaciente(crudo: Partial<PacienteCrudo>): Paciente | null {
  try {
    const idNum = Number(crudo.id);
    if (isNaN(idNum) || idNum <= 0 || !Number.isInteger(idNum)) {
      return null;
    }

    if (
      !crudo.dni ||
      !crudo.nombre ||
      !crudo.apellido ||
      !crudo.fechaNacimiento ||
      !crudo.telefono
    ) {
      return null;
    }

    const dniSanitizado = String(crudo.dni).trim();
    const nombreSanitizado = aTitleCase(String(crudo.nombre));
    const apellidoSanitizado = aTitleCase(String(crudo.apellido));
    const fechaNacimientoSanitizada = String(crudo.fechaNacimiento).trim();
    const telefonoSanitizado = String(crudo.telefono).trim();

    return {
      id: idNum,
      dni: dniSanitizado,
      nombre: nombreSanitizado,
      apellido: apellidoSanitizado,
      fechaNacimiento: fechaNacimientoSanitizada,
      telefono: telefonoSanitizado,
      ...(crudo.email ? { email: String(crudo.email).trim() } : {}),
      ...(crudo.direccion ? { direccion: String(crudo.direccion).trim() } : {}),
      ...(crudo.obraSocial ? { obraSocial: String(crudo.obraSocial).trim() } : {}),
    };
  } catch {
    return null;
  }
}