export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, "UNAUTHORIZED", 403);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed") {
    super(message, "VALIDATION_ERROR", 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, "NOT_FOUND", 404);
  }
}

export class InsufficientStockError extends AppError {
  constructor(resource: string = "Resource") {
    super(`Insufficient ${resource} stock`, "INSUFFICIENT_STOCK", 400);
  }
}
