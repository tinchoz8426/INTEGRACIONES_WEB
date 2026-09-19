import { Request, Response } from 'express';
import { errorResponse } from '../utils/httpError.js';

export const helloWorld = async (_req: Request, res: Response): Promise<Response> => {
  let status = 200;
  try {
    const body = {
      message: '¡Bienvenido a la API TurnosRed!',
      endpoints: [
        'GET  /',
        'GET  /turnos',
        'GET  /turnos/:id',
        'POST /turnos',
        'PUT  /turnos/:id',
        'DELETE /turnos/:id',
        'GET  /medicos',
        'GET  /medicos/:id',
        'POST /medicos',
        'PUT  /medicos/:id',
        'DELETE /medicos/:id',
        'GET  /pacientes',
        'GET  /pacientes/:id',
        'GET  /pacientes/:id/turnos',
        'POST /pacientes',
        'PUT  /pacientes/:id',
        'DELETE /pacientes/:id',
      ],
      timestamp: new Date().toISOString(),
    };

    return res.status(status).json(body);
  } catch (error) {
    status = errorResponse(error).status;
    return res.status(status).json(errorResponse(error));
  }
};

export const notFoundRoute = async (req: Request, res: Response): Promise<Response> => {
  let status = 404;
  try {
    return res.status(status).json({
      status,
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
      code: 'NOT_FOUND',
      details: [],
    });
  } catch (error) {
    status = errorResponse(error).status;
    return res.status(status).json(errorResponse(error));
  }
};