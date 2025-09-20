import { NextFunction, Request, Response } from 'express';
import { applicationLogger } from '../logger';

export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly details: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFoundHandler = (request: Request, response: Response, next: NextFunction) => {
  if (!response.headersSent) {
    next(new HttpError(404, `Route not found: ${request.method} ${request.originalUrl}`));
  }
};

export const globalErrorHandler = (
  error: Error,
  request: Request,
  response: Response,
  _next: NextFunction
) => {
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const responseBody = error instanceof HttpError ? error.details ?? { message: error.message } : null;

  applicationLogger.error(
    {
      err: error,
      statusCode,
      path: request.originalUrl
    },
    'Unhandled error while processing request'
  );

  response.status(statusCode).json({
    error: {
      message: error.message,
      details: responseBody
    }
  });
};
