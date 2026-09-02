import { Request, Response } from 'express';
import { medicoService } from '../services/medico.service.js';

export const getMedicos = (req: Request, res: Response): void => {
  const { especialidad, disponible } = req.query as {
    especialidad?: string;
    disponible?: string;
  };
  res.status(200).json(
    medicoService.obtenerTodos({
      especialidad,
      disponible: disponible !== undefined ? disponible === 'true' : undefined,
    })
  );
};

export const getMedicoById = (req: Request, res: Response): void => {
  const medico = medicoService.obtenerPorId(Number(req.params.id));
  res.status(200).json(medico);
};

export const createMedico = (req: Request, res: Response): void => {
  const nuevoMedico = medicoService.crear(req.body);
  res.status(201).json(nuevoMedico);
};

export const updateMedico = (req: Request, res: Response): void => {
  const medicoActualizado = medicoService.actualizar(
    Number(req.params.id),
    req.body
  );
  res.status(200).json(medicoActualizado);
};

export const deleteMedico = (req: Request, res: Response): void => {
  medicoService.eliminar(Number(req.params.id));
  res.status(204).send();
};
