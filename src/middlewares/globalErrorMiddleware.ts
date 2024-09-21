import { Request, Response, NextFunction } from 'express';

import AppError from '../utils/AppError';

const globalErrorMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err);

  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
};

export default globalErrorMiddleware;
