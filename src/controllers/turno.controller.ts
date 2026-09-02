import { Request, Response } from 'express';
import { turnoService } from '../services/turno.service.js';

export const getTurnos = (req: Request, res: Response): void => {
  const { especialidad, fecha, medicoId } = req.query as {
    especialidad?: string;
    fecha?: string;
    medicoId?: string;
  };
  res.status(200).json(
    turnoService.obtenerTodos({
      especialidad,
      fecha,
      medicoId: medicoId ? Number(medicoId) : undefined,
    })
  );
};

export const getTurnoById = (req: Request, res: Response): void => {
  const turno = turnoService.obtenerPorId(Number(req.params.id));
  res.status(200).json(turno);
};

export const createTurno = (req: Request, res: Response): void => {
  const nuevoTurno = turnoService.crear(req.body);
  res.status(201).json(nuevoTurno);
};

export const updateTurno = (req: Request, res: Response): void => {
  const turnoActualizado = turnoService.actualizar(
    Number(req.params.id),
    req.body
  );
  res.status(200).json(turnoActualizado);
};

export const deleteTurno = (req: Request, res: Response): void => {
  turnoService.eliminar(Number(req.params.id));
  res.status(204).send();
};
