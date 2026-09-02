import fs from 'node:fs/promises';
import { MEDICOS_PATH } from '../config/env.js';
import {
  Medico,
  MedicoCrudo,
  normalizarMedico,
} from '../models/medico.model.js';
import { AppError, badRequest, notFound } from '../utils/AppError.js';
import { aTitleCase } from '../models/turno.model.js';
import { sinDiacriticos } from '../utils/text.js';

export interface MedicoFiltros {
  especialidad?: string;
  disponible?: boolean;
}

class MedicoService {
  private medicos: Medico[] = [];

  async cargarMedicosIniciales(): Promise<void> {
    try {
      const content = await fs.readFile(MEDICOS_PATH, 'utf-8');
      const rawData: MedicoCrudo[] = JSON.parse(content);

      let aceptados = 0;
      let rechazados = 0;

      this.medicos = rawData.reduce<Medico[]>((acc, item) => {
        const medicoNormalizado = normalizarMedico(item);
        if (medicoNormalizado) {
          acc.push(medicoNormalizado);
          aceptados++;
        } else {
          rechazados++;
        }
        return acc;
      }, []);

      console.log(
        `[Procesamiento Inicial] Médicos Aceptados: ${aceptados} | Médicos Rechazados: ${rechazados}`
      );
    } catch (error) {
      throw new AppError(
        500,
        'DATA_LOAD_ERROR',
        'Error al leer el archivo medicos.json.',
        [error]
      );
    }
  }

  obtenerTodos(filtros: MedicoFiltros = {}): Medico[] {
    const especialidad = filtros.especialidad
      ? aTitleCase(filtros.especialidad)
      : undefined;

    return this.medicos.filter((m) => {
      if (
        especialidad &&
        !sinDiacriticos(m.especialidad).includes(sinDiacriticos(especialidad))
      ) {
        return false;
      }
      if (filtros.disponible !== undefined && m.activo !== filtros.disponible) {
        return false;
      }
      return true;
    });
  }

  obtenerPorId(id: number): Medico {
    const medico = this.medicos.find((m) => m.id === id);
    if (!medico) {
      throw notFound('Médico no encontrado.');
    }
    return medico;
  }

  crear(nuevoMedicoData: MedicoCrudo): Medico {
    const nuevoMedico = normalizarMedico(nuevoMedicoData);
    if (!nuevoMedico) {
      throw badRequest('Estructura de médico inválida.', [
        'Estructura de médico inválida.',
      ]);
    }

    const existe = this.medicos.some((m) => m.id === nuevoMedico.id);
    if (existe) {
      throw new AppError(409, 'CONFLICT', 'El ID de médico ya existe.');
    }

    this.medicos.push(nuevoMedico);
    return nuevoMedico;
  }

  actualizar(id: number, datosActualizados: Partial<MedicoCrudo>): Medico {
    const index = this.medicos.findIndex((m) => m.id === id);
    if (index === -1) {
      throw notFound('Médico no encontrado.');
    }

    const medicoActual = this.medicos[index];
    const medicoMerged = { ...medicoActual, ...datosActualizados, id };
    const medicoNormalizado = normalizarMedico(medicoMerged);

    if (!medicoNormalizado) {
      throw badRequest('Datos de actualización inválidos.', [
        'Datos de actualización inválidos.',
      ]);
    }

    this.medicos[index] = medicoNormalizado;
    return medicoNormalizado;
  }

  eliminar(id: number): void {
    const index = this.medicos.findIndex((m) => m.id === id);
    if (index === -1) {
      throw notFound('Médico no encontrado.');
    }

    this.medicos.splice(index, 1);
  }
}

export const medicoService = new MedicoService();
