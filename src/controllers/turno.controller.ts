import { Request, Response } from 'express';
import { turnoService } from '../services/turno.service.js';
import { httpError, errorResponse } from '../utils/httpError.js';

function validarId(idParam: unknown): number {
  const valor = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw httpError(
      400,
      'El ID de turno debe ser un número entero positivo.',
      'INVALID_ID',
      [{ path: 'id', message: 'El ID de turno debe ser un número entero positivo.' }]
    );
  }
  return id;
}

export const getTurnos = async (req: Request, res: Response): Promise<Response> => {
  let status = 200;
  try {
    const { especialidad, fecha, medicoId } = req.query as {
      especialidad?: string;
      fecha?: string;
      medicoId?: string;
    };

    const turnos = turnoService.obtenerTodos({
      especialidad,
      fecha,
      medicoId: medicoId ? Number(medicoId) : undefined,
    });

    return res.status(status).json(turnos);
  } catch (error) {
    status = errorResponse(error).status;
    return res.status(status).json(errorResponse(error));
  }
};

export const getTurnoById = async (req: Request, res: Response): Promise<Response> => {
  let status = 200;
  try {
    const id = validarId(req.params.id);
    const turno = turnoService.obtenerPorId(id);

    return res.status(status).json(turno);
  } catch (error) {
    status = errorResponse(error).status;
    return res.status(status).json(errorResponse(error));
  }
};

export const createTurno = async (req: Request, res: Response): Promise<Response> => {
  let status = 201;
  try {
    if (
      req.body.id === undefined ||
      !Number.isInteger(Number(req.body.id)) ||
      Number(req.body.id) <= 0
    ) {
      throw httpError(
        400,
        'El ID de turno es obligatorio y debe ser un número entero positivo.',
        'VALIDATION_ERROR',
        [{ path: 'id', message: 'El ID de turno es obligatorio y debe ser un número entero positivo.' }]
      );
    }

    const nuevoTurno = turnoService.crear(req.body);
    return res.status(status).json(nuevoTurno);
  } catch (error) {
    status = errorResponse(error).status;
    return res.status(status).json(errorResponse(error));
  }
};

export const updateTurno = async (req: Request, res: Response): Promise<Response> => {
  let status = 200;
  try {
    const id = validarId(req.params.id);
    const turnoActualizado = turnoService.actualizar(id, req.body);

    return res.status(status).json(turnoActualizado);
  } catch (error) {
    status = errorResponse(error).status;
    return res.status(status).json(errorResponse(error));
  }
};

export const deleteTurno = async (req: Request, res: Response): Promise<Response> => {
  let status = 204;
  try {
    const id = validarId(req.params.id);
    turnoService.eliminar(id);

    return res.status(status).send();
  } catch (error) {
    status = errorResponse(error).status;
    return res.status(status).json(errorResponse(error));
  }
};