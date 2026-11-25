export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Solicitud invalida', details?: unknown) {
    super(400, 'BAD_REQUEST', message, details);
  }
}

export class ValidationError extends AppError {
  constructor(details: unknown, message = 'Los datos enviados no son validos') {
    super(422, 'VALIDATION_ERROR', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Credenciales invalidas o sesion expirada') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'No tiene permisos para realizar esta accion') {
    super(403, 'FORBIDDEN', message);
  }
}

export class NotFoundError extends AppError {
  constructor(entity = 'Recurso', message?: string) {
    super(404, 'NOT_FOUND', message ?? `${entity} no encontrado`);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'La operacion entra en conflicto con el estado actual', details?: unknown) {
    super(409, 'CONFLICT', message, details);
  }
}

export class LockedError extends AppError {
  constructor(message = 'La cuenta esta bloqueada temporalmente') {
    super(423, 'LOCKED', message);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Demasiadas solicitudes, intente mas tarde') {
    super(429, 'TOO_MANY_REQUESTS', message);
  }
}
