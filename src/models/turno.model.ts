export interface TurnoCrudo {
  id: string | number;
  paciente: string;
  documento: string | number;
  especialidad: string;
  fecha: string;
  hora: string;
  confirmado: string | boolean;
  medicoId?: string | number;
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
  medicoId?: number;
  observaciones?: string;
}

export function aTitleCase(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .replace(
      /(^|\s)(\p{L})/gu,
      (_m, espacio, letra) => espacio + letra.toUpperCase()
    );
}

export function normalizarTurno(crudo: Partial<TurnoCrudo>): Turno | null {
  try {
    const idNum = Number(crudo.id);
    if (isNaN(idNum) || idNum <= 0 || !Number.isInteger(idNum)) {
      return null;
    }

    if (
      !crudo.paciente ||
      !crudo.documento ||
      !crudo.especialidad ||
      !crudo.fecha ||
      !crudo.hora
    ) {
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
      confirmadoBooleano =
        val === 'si' || val === 'sí' || val === 'true' || val === '1';
    }

    let medicoIdNormalizado: number | undefined;
    if (
      crudo.medicoId !== undefined &&
      crudo.medicoId !== null &&
      crudo.medicoId !== ''
    ) {
      const mId = Number(crudo.medicoId);
      if (!isNaN(mId) && mId > 0 && Number.isInteger(mId)) {
        medicoIdNormalizado = mId;
      }
    }

    return {
      id: idNum,
      paciente: pacienteSanitizado,
      documento: documentoSanitizado,
      especialidad: aTitleCase(String(crudo.especialidad)),
      fecha: fechaSanitizada,
      hora: horaSanitizada,
      confirmado: confirmadoBooleano,
      ...(medicoIdNormalizado ? { medicoId: medicoIdNormalizado } : {}),
      ...(crudo.observaciones
        ? { observaciones: String(crudo.observaciones).trim() }
        : {}),
    };
  } catch {
    return null;
  }
}
