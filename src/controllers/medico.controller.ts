import { Request, Response } from 'express';
import { medicoService } from '../services/medico.service.js';
import { httpError, errorResponse } from '../utils/httpError.js';

function validarId(idParam: unknown): number {
  const valor = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw httpError(
      400,
      'El ID de médico debe ser un número entero positivo.',
      'INVALID_ID',
      [{ path: 'id', message: 'El ID de médico debe ser un número entero positivo.' }]
    );
  }
  return id;
}

export const getMedicos = async (req: Request, res: Response): Promise<Response> => {
  let status = 200;
  try {
    const { especialidad, disponible } = req.query as {
      especialidad?: string;
      disponible?: string;
    };

    const medicos = medicoService.obtenerTodos({
      especialidad,
      disponible: disponible !== undefined ? disponible === 'true' : undefined,
    });

    return res.status(status).json(medicos);
  } catch (error) {
    status = errorResponse(error).status;
    return res.status(status).json(errorResponse(error));
  }
};

export const getMedicoById = async (req: Request, res: Response): Promise<Response> => {
  let status = 200;
  try {
    const id = validarId(req.params.id);
    const medico = medicoService.obtenerPorId(id);

    return res.status(status).json(medico);
  } catch (error) {
    status = errorResponse(error).status;
    return res.status(status).json(errorResponse(error));
  }
};

export const createMedico = async (req: Request, res: Response): Promise<Response> => {
  let status = 201;
  try {
    if (
      req.body.id === undefined ||
      !Number.isInteger(Number(req.body.id)) ||
      Number(req.body.id) <= 0
    ) {
      throw httpError(
        400,
        'El ID de médico es obligatorio y debe ser un número entero positivo.',
        'VALIDATION_ERROR',
        [{ path: 'id', message: 'El ID de médico es obligatorio y debe ser un número entero positivo.' }]
      );
    }

    const nuevoMedico = medicoService.crear(req.body);
    return res.status(status).json(nuevoMedico);
  } catch (error) {
    status = errorResponse(error).status;
    return res.status(status).json(errorResponse(error));
  }
};

export const updateMedico = async (req: Request, res: Response): Promise<Response> => {
  let status = 200;
  try {
    const id = validarId(req.params.id);
    const medicoActualizado = medicoService.actualizar(id, req.body);

    return res.status(status).json(medicoActualizado);
  } catch (error) {
    status = errorResponse(error).status;
    return res.status(status).json(errorResponse(error));
  }
};

export const deleteMedico = async (req: Request, res: Response): Promise<Response> => {
  let status = 204;
  try {
    const id = validarId(req.params.id);
    medicoService.eliminar(id);

    return res.status(status).send();
  } catch (error) {
    status = errorResponse(error).status;
    return res.status(status).json(errorResponse(error));
  }
};