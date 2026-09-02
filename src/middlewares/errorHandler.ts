import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

interface ErrorResponse {
  status: number;
  message: string;
  code: string;
  details: unknown[];
}

export function notFoundHandler(req: Request, res: Response): void {
  const body: ErrorResponse = {
    status: 404,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    code: 'NOT_FOUND',
    details: [],
  };
  res.status(404).json(body);
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let body: ErrorResponse;

  if (error instanceof ZodError) {
    body = {
      status: 400,
      message: 'Error de validación en los datos ingresados.',
      code: 'VALIDATION_ERROR',
      details: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  } else if (error instanceof AppError) {
    body = {
      status: error.status,
      message: error.message,
      code: error.code,
      details: error.details,
    };
  } else {
    console.error(error);
    body = {
      status: 500,
      message: 'Error interno del servidor.',
      code: 'INTERNAL_SERVER_ERROR',
      details: [],
    };
  }

  res.status(body.status).json(body);
}
