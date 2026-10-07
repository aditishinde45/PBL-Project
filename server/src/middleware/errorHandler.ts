import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('[ElderEase Error]:', err);

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Sorry, something went wrong. Please try again.'
      : err.message || 'Sorry, something went wrong. Please try again.';

  res.status(statusCode).json({
    success: false,
    error: message,
    code: err.code || 'INTERNAL_ERROR',
  });
}
