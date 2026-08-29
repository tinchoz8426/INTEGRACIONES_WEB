export interface TurnoCrudo {
  id: string | number;
  paciente: string;
  documento: string | number;
  especialidad: string;
  fecha: string;
  hora: string;
  confirmado: string | boolean;
  observaciones?: string;
}

export interface Turno {
  id: number;
  paciente: string;
  documento: string;
  especialidad: string;
  fecha: string;
  hora: string;
  confirmado: boolean;
  observaciones?: string;
}

export function normalizarTurno(crudo: Partial<TurnoCrudo>): Turno | null {
  try {
    const idNum = Number(crudo.id);
    if (isNaN(idNum) || idNum <= 0 || !Number.isInteger(idNum)) {
      return null;
    }

    if (!crudo.paciente || !crudo.documento || !crudo.especialidad || !crudo.fecha || !crudo.hora) {
      return null;
    }

    const pacienteSanitizado = String(crudo.paciente).trim();
    const documentoSanitizado = String(crudo.documento).trim();
    const horaSanitizada = String(crudo.hora).replace('.', ':').trim();
    const fechaSanitizada = String(crudo.fecha).trim();

    let confirmadoBooleano = false;
    if (typeof crudo.confirmado === 'boolean') {
      confirmadoBooleano = crudo.confirmado;
    } else if (typeof crudo.confirmado === 'string') {
      const val = crudo.confirmado.trim().toLowerCase();
      confirmadoBooleano = val === 'si' || val === 'sí' || val === 'true' || val === '1';
    }

    return {
      id: idNum,
      paciente: pacienteSanitizado,
      documento: documentoSanitizado,
      especialidad: String(crudo.especialidad).trim().toUpperCase(),
      fecha: fechaSanitizada,
      hora: horaSanitizada,
      confirmado: confirmadoBooleano,
      ...(crudo.observaciones ? { observaciones: String(crudo.observaciones).trim() } : {}),
    };
  } catch {
    return null;
  }
}