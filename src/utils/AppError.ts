export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details: unknown[];

  constructor(
    status: number,
    code: string,
    message: string,
    details: unknown[] = []
  ) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (
  message = 'Solicitud inválida.',
  details: unknown[] = []
): AppError => new AppError(400, 'BAD_REQUEST', message, details);

export const notFound = (message = 'Recurso no encontrado.'): AppError =>
  new AppError(404, 'NOT_FOUND', message);
