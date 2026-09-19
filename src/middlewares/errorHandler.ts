import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ErrorResponse, errorResponse } from '../utils/httpError.js';

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
  } else if (error instanceof Error && typeof error.message === 'string') {
    body = errorResponse(error);
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