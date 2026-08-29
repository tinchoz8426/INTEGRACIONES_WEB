import { Request, Response } from 'express';
import { turnoService } from '../services/turno.service.js';

export const getTurnos = (_req: Request, res: Response): void => {
  try {
    const turnos = turnoService.obtenerTodos();
    res.status(200).json(turnos);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

export const getTurnoById = (req: Request, res: Response): void => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'El ID debe ser un número válido.' });
      return;
    }
    const turno = turnoService.obtenerPorId(id);
    if (!turno) {
      res.status(404).json({ error: 'Turno no encontrado.' });
      return;
    }
    res.status(200).json(turno);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

export const createTurno = (req: Request, res: Response): void => {
  try {
    const nuevoTurno = turnoService.crear(req.body);
    res.status(201).json(nuevoTurno);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al crear el turno.' });
  }
};

export const updateTurno = (req: Request, res: Response): void => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'El ID debe ser un número válido.' });
      return;
    }
    const turnoActualizado = turnoService.actualizar(id, req.body);
    res.status(200).json(turnoActualizado);
  } catch (error: any) {
    if (error.message === 'Turno no encontrado.') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(400).json({ error: error.message || 'Error al actualizar el turno.' });
  }
};

export const deleteTurno = (req: Request, res: Response): void => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'El ID debe ser un número válido.' });
      return;
    }
    const turnoEliminado = turnoService.eliminar(id);
    res.status(200).json({ mensaje: 'Turno eliminado correctamente.', turno: turnoEliminado });
  } catch (error: any) {
    if (error.message === 'Turno no encontrado.') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Error al eliminar el turno.' });
  }
};