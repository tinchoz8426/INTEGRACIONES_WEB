import fs from 'node:fs/promises';
import { DATA_PATH } from '../config/env.js';
import { Turno, TurnoCrudo, normalizarTurno } from '../models/turno.model.js';
import { appEvents } from '../events/eventEmitter.js';

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

      console.log(`[Procesamiento Inicial] Registros Aceptados: ${aceptados} | Registros Rechazados: ${rechazados}`);
    } catch (error) {
      console.error('Error al leer el archivo turnos.json:', error);
      this.turnos = [];
    }
  }

  obtenerTodos(): Turno[] {
    return this.turnos;
  }

  obtenerPorId(id: number): Turno | undefined {
    return this.turnos.find((t) => t.id === id);
  }

  crear(nuevoTurnoData: TurnoCrudo): Turno {
    const nuevoTurno = normalizarTurno(nuevoTurnoData);
    if (!nuevoTurno) {
      throw new Error('Estructura de turno inválida.');
    }

    const existe = this.turnos.some((t) => t.id === nuevoTurno.id);
    if (existe) {
      throw new Error('El ID de turno ya existe.');
    }

    this.turnos.push(nuevoTurno);
    appEvents.emit('turno:creado', nuevoTurno);
    return nuevoTurno;
  }

  actualizar(id: number, datosActualizados: Partial<TurnoCrudo>): Turno {
    const index = this.turnos.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error('Turno no encontrado.');
    }

    const turnoActual = this.turnos[index];
    const turnoMerged = { ...turnoActual, ...datosActualizados, id };
    const turnoNormalizado = normalizarTurno(turnoMerged);

    if (!turnoNormalizado) {
      throw new Error('Datos de actualización inválidos.');
    }

    this.turnos[index] = turnoNormalizado;
    appEvents.emit('turno:actualizado', turnoNormalizado);
    return turnoNormalizado;
  }

  eliminar(id: number): Turno {
    const index = this.turnos.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error('Turno no encontrado.');
    }

    const [turnoEliminado] = this.turnos.splice(index, 1);
    appEvents.emit('turno:eliminado', turnoEliminado);
    return turnoEliminado;
  }
}

export const turnoService = new TurnoService();