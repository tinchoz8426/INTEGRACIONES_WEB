import { Request, Response } from 'express';
import { pacienteService } from '../services/paciente.service.js';
import { httpError, errorResponse } from '../utils/httpError.js';

function validarId(idParam: unknown): number {
  const valor = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw httpError(
      400,
      'El ID de paciente debe ser un número entero positivo.',
      'INVALID_ID',
      [{ path: 'id', message: 'El ID de paciente debe ser un número entero positivo.' }]
    );
  }
  return id;
}

export const getPacientes = async (req: Request, res: Response): Promise<Response> => {
  let status = 200;
  try {
    const { apellido } = req.query as { apellido?: string };

    const pacientes = pacienteService.obtenerTodos({ apellido });

    return res.status(status).json(pacientes);
  } catch (error) {
    status = errorResponse(error).status;
    return res.status(status).json(errorResponse(error));
  }
};

export const getPacienteById = async (req: Request, res: Response): Promise<Response> => {
  let status = 200;
  try {
    const id = validarId(req.params.id);
    const paciente = pacienteService.obtenerPorId(id);

    return res.status(status).json(paciente);
  } catch (error) {
    status = errorResponse(error).status;
    return res.status(status).json(errorResponse(error));
  }
};

export const getTurnosDePaciente = async (
  req: Request,
  res: Response
): Promise<Response> => {
  let status = 200;
  try {
    const id = validarId(req.params.id);
    const turnos = pacienteService.obtenerTurnos(id);

    return res.status(status).json(turnos);
  } catch (error) {
    status = errorResponse(error).status;
    return res.status(status).json(errorResponse(error));
  }
};

export const createPaciente = async (req: Request, res: Response): Promise<Response> => {
  let status = 201;
  try {
    if (
      req.body.id === undefined ||
      !Number.isInteger(Number(req.body.id)) ||
      Number(req.body.id) <= 0
    ) {
      throw httpError(
        400,
        'El ID de paciente es obligatorio y debe ser un número entero positivo.',
        'VALIDATION_ERROR',
        [{ path: 'id', message: 'El ID de paciente es obligatorio y debe ser un número entero positivo.' }]
      );
    }

    const nuevoPaciente = pacienteService.crear(req.body);
    return res.status(status).json(nuevoPaciente);
  } catch (error) {
    status = errorResponse(error).status;
    return res.status(status).json(errorResponse(error));
  }
};

export const updatePaciente = async (req: Request, res: Response): Promise<Response> => {
  let status = 200;
  try {
    const id = validarId(req.params.id);
    const pacienteActualizado = pacienteService.actualizar(id, req.body);

    return res.status(status).json(pacienteActualizado);
  } catch (error) {
    status = errorResponse(error).status;
    return res.status(status).json(errorResponse(error));
  }
};

export const deletePaciente = async (req: Request, res: Response): Promise<Response> => {
  let status = 204;
  try {
    const id = validarId(req.params.id);
    pacienteService.eliminar(id);

    return res.status(status).send();
  } catch (error) {
    status = errorResponse(error).status;
    return res.status(status).json(errorResponse(error));
  }
};