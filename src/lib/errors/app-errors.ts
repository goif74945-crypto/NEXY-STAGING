type AppErrorInput = {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
};

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(input: AppErrorInput) {
    super(input.message);
    this.name = 'AppError';
    this.code = input.code;
    this.statusCode = input.statusCode;
    this.details = input.details;
  }
}

export class ValidationAppError extends AppError {
  constructor(details?: Record<string, unknown>) {
    super({
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed.',
      statusCode: 400,
      details,
    });
  }
}

export class UnauthorizedAppError extends AppError {
  constructor(details?: Record<string, unknown>) {
    super({
      code: 'UNAUTHORIZED',
      message: 'Authentication is required.',
      statusCode: 401,
      details,
    });
  }
}

export class ForbiddenAppError extends AppError {
  constructor(details?: Record<string, unknown>) {
    super({
      code: 'FORBIDDEN',
      message: 'You do not have permission to perform this action.',
      statusCode: 403,
      details,
    });
  }
}

export class NotFoundAppError extends AppError {
  constructor(details?: Record<string, unknown>) {
    super({
      code: 'NOT_FOUND',
      message: 'Requested resource was not found.',
      statusCode: 404,
      details,
    });
  }
}

export class ConflictAppError extends AppError {
  constructor(details?: Record<string, unknown>) {
    super({
      code: 'CONFLICT',
      message: 'Resource state conflict detected.',
      statusCode: 409,
      details,
    });
  }
}

export class InternalAppError extends AppError {
  constructor(details?: Record<string, unknown>) {
    super({
      code: 'INTERNAL_ERROR',
      message: 'Unexpected internal server error.',
      statusCode: 500,
      details,
    });
  }
}
