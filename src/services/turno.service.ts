import fs from 'node:fs/promises';
import { DATA_PATH } from '../config/env.js';
import {
  Turno,
  TurnoCrudo,
  aTitleCase,
  normalizarTurno,
} from '../models/turno.model.js';
import { appEvents } from '../events/eventEmitter.js';
import { AppError, badRequest, notFound } from '../utils/AppError.js';
import { sinDiacriticos } from '../utils/text.js';

export interface TurnoFiltros {
  especialidad?: string;
  fecha?: string;
  medicoId?: number;
}

class TurnoService {
  private turnos: Turno[] = [];

  async cargarTurnosIniciales(): Promise<void> {
    try {
      const content = await fs.readFile(DATA_PATH, 'utf-8');
      const rawData: TurnoCrudo[] = JSON.parse(content);

      let aceptados = 0;
      let rechazados = 0;

      this.turnos = rawData.reduce<Turno[]>((acc, item) => {
        const turnoNormalizado = normalizarTurno(item);
        if (turnoNormalizado) {
          acc.push(turnoNormalizado);
          aceptados++;
        } else {
          rechazados++;
        }
        return acc;
      }, []);

      console.log(
        `[Procesamiento Inicial] Turnos Aceptados: ${aceptados} | Turnos Rechazados: ${rechazados}`
      );
    } catch (error) {
      throw new AppError(
        500,
        'DATA_LOAD_ERROR',
        'Error al leer el archivo turnos.json.',
        [error]
      );
    }
  }

  obtenerTodos(filtros: TurnoFiltros = {}): Turno[] {
    const especialidad = filtros.especialidad
      ? aTitleCase(filtros.especialidad)
      : undefined;

    return this.turnos.filter((t) => {
      if (
        especialidad &&
        !sinDiacriticos(t.especialidad).includes(sinDiacriticos(especialidad))
      ) {
        return false;
      }
      if (filtros.fecha && t.fecha !== filtros.fecha) {
        return false;
      }
      if (filtros.medicoId !== undefined && t.medicoId !== filtros.medicoId) {
        return false;
      }
      return true;
    });
  }

  obtenerPorId(id: number): Turno {
    const turno = this.turnos.find((t) => t.id === id);
    if (!turno) {
      throw notFound('Turno no encontrado.');
    }
    return turno;
  }

  crear(nuevoTurnoData: TurnoCrudo): Turno {
    const nuevoTurno = normalizarTurno(nuevoTurnoData);
    if (!nuevoTurno) {
      throw badRequest('Estructura de turno inválida.', [
        'Estructura de turno inválida.',
      ]);
    }

    const existe = this.turnos.some((t) => t.id === nuevoTurno.id);
    if (existe) {
      throw new AppError(409, 'CONFLICT', 'El ID de turno ya existe.');
    }

    this.turnos.push(nuevoTurno);
    appEvents.emit('turno:creado', nuevoTurno);
    return nuevoTurno;
  }

  actualizar(id: number, datosActualizados: Partial<TurnoCrudo>): Turno {
    const index = this.turnos.findIndex((t) => t.id === id);
    if (index === -1) {
      throw notFound('Turno no encontrado.');
    }

    const turnoActual = this.turnos[index];
    const turnoMerged = { ...turnoActual, ...datosActualizados, id };
    const turnoNormalizado = normalizarTurno(turnoMerged);

    if (!turnoNormalizado) {
      throw badRequest('Datos de actualización inválidos.', [
        'Datos de actualización inválidos.',
      ]);
    }

    this.turnos[index] = turnoNormalizado;
    appEvents.emit('turno:actualizado', turnoNormalizado);
    return turnoNormalizado;
  }

  eliminar(id: number): void {
    const index = this.turnos.findIndex((t) => t.id === id);
    if (index === -1) {
      throw notFound('Turno no encontrado.');
    }

    const [turnoEliminado] = this.turnos.splice(index, 1);
    appEvents.emit('turno:eliminado', turnoEliminado);
  }
}

export const turnoService = new TurnoService();
