import fs from 'node:fs/promises';
import { PACIENTES_PATH } from '../config/env.js';
import {
  Paciente,
  PacienteCrudo,
  normalizarPaciente,
} from '../models/paciente.model.js';
import { AppError, badRequest, notFound } from '../utils/AppError.js';
import { turnoService } from './turno.service.js';
import { Turno } from '../models/turno.model.js';

export interface PacienteFiltros {
  apellido?: string;
}

class PacienteService {
  private pacientes: Paciente[] = [];

  async cargarPacientesIniciales(): Promise<void> {
    try {
      const content = await fs.readFile(PACIENTES_PATH, 'utf-8');
      const rawData: PacienteCrudo[] = JSON.parse(content);

      let aceptados = 0;
      let rechazados = 0;

      this.pacientes = rawData.reduce<Paciente[]>((acc, item) => {
        const pacienteNormalizado = normalizarPaciente(item);
        if (pacienteNormalizado) {
          acc.push(pacienteNormalizado);
          aceptados++;
        } else {
          rechazados++;
        }
        return acc;
      }, []);

      console.log(
        `[Procesamiento Inicial] Pacientes Aceptados: ${aceptados} | Pacientes Rechazados: ${rechazados}`
      );
    } catch (error) {
      throw new AppError(
        500,
        'DATA_LOAD_ERROR',
        'Error al leer el archivo pacientes.json.',
        [error]
      );
    }
  }

  obtenerTodos(filtros: PacienteFiltros = {}): Paciente[] {
    const apellido = filtros.apellido?.trim().toLowerCase();

    return this.pacientes.filter((p) => {
      if (apellido && p.apellido.toLowerCase() !== apellido) {
        return false;
      }
      return true;
    });
  }

  obtenerPorId(id: number): Paciente {
    const paciente = this.pacientes.find((p) => p.id === id);
    if (!paciente) {
      throw notFound('Paciente no encontrado.');
    }
    return paciente;
  }

  crear(nuevoPacienteData: PacienteCrudo): Paciente {
    const nuevoPaciente = normalizarPaciente(nuevoPacienteData);
    if (!nuevoPaciente) {
      throw badRequest('Estructura de paciente inválida.', [
        'Estructura de paciente inválida.',
      ]);
    }

    const existeId = this.pacientes.some((p) => p.id === nuevoPaciente.id);
    if (existeId) {
      throw new AppError(409, 'CONFLICT', 'El ID de paciente ya existe.');
    }

    const existeDni = this.pacientes.some(
      (p) => p.dni.trim().toLowerCase() === nuevoPaciente.dni.trim().toLowerCase()
    );
    if (existeDni) {
      throw new AppError(409, 'CONFLICT', 'El DNI de paciente ya existe.');
    }

    this.pacientes.push(nuevoPaciente);
    return nuevoPaciente;
  }

  actualizar(id: number, datosActualizados: Partial<PacienteCrudo>): Paciente {
    const index = this.pacientes.findIndex((p) => p.id === id);
    if (index === -1) {
      throw notFound('Paciente no encontrado.');
    }

    const pacienteActual = this.pacientes[index];
    const pacienteMerged = { ...pacienteActual, ...datosActualizados, id };
    const pacienteNormalizado = normalizarPaciente(pacienteMerged);

    if (!pacienteNormalizado) {
      throw badRequest('Datos de actualización inválidos.', [
        'Datos de actualización inválidos.',
      ]);
    }

    const dniDuplicado = this.pacientes.some(
      (p) =>
        p.id !== id &&
        p.dni.trim().toLowerCase() ===
          pacienteNormalizado.dni.trim().toLowerCase()
    );
    if (dniDuplicado) {
      throw new AppError(409, 'CONFLICT', 'El DNI de paciente ya existe.');
    }

    this.pacientes[index] = pacienteNormalizado;
    return pacienteNormalizado;
  }

  eliminar(id: number): void {
    const index = this.pacientes.findIndex((p) => p.id === id);
    if (index === -1) {
      throw notFound('Paciente no encontrado.');
    }

    this.pacientes.splice(index, 1);
  }

  obtenerTurnos(id: number): Turno[] {
    const paciente = this.obtenerPorId(id);
    return turnoService.obtenerTurnosPorPaciente(paciente.id, paciente.dni);
  }
}

export const pacienteService = new PacienteService();