export interface ErrorConEstado extends Error {
  status?: number;
  code?: string;
  details?: unknown[];
}

export interface ErrorResponse {
  status: number;
  message: string;
  code: string;
  details: unknown[];
}

export function httpError(
  status: number,
  message: string,
  code = 'BAD_REQUEST',
  details: unknown[] = []
): ErrorConEstado {
  const error = new Error(message) as ErrorConEstado;
  error.name = 'HttpError';
  error.status = status;
  error.code = code;
  error.details = details;
  return error;
}

export function errorResponse(error: unknown): ErrorResponse {
  if (error instanceof Error) {
    const err = error as ErrorConEstado;
    return {
      status: typeof err.status === 'number' && err.status >= 400 ? err.status : 500,
      message: err.message || 'Error interno del servidor.',
      code: err.code || 'INTERNAL_SERVER_ERROR',
      details: Array.isArray(err.details) ? err.details : [],
    };
  }
  return {
    status: 500,
    message: 'Error interno del servidor.',
    code: 'INTERNAL_SERVER_ERROR',
    details: [],
  };
}