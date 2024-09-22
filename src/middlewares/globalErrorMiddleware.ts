import { Request, Response, NextFunction } from 'express';

import AppError from '../utils/AppError';
import { IResError, ResStatus } from '../types';

const mongoValidationErr = (err: AppError) => {
  const message = err.message
    .split(':')
    .slice(1)
    .join(':')
    .trim()
    .toLowerCase();
    
  return new AppError(message, 400);
};

const jwtInvalidTokenErr = () =>
  new AppError('Invalid token. Please login again', 403);

const jwtTokenExpiredErr = () =>
  new AppError('Token expired. Please login again', 403);

const sendDevErr = (err: AppError, res: Response<IResError>) => {
  return res.status(err.statusCode).json({
    status: ResStatus.Fail,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

const sendProErr = (err: AppError, res: Response<IResError>) => {
  return res.status(err.statusCode).json({
    status: ResStatus.Fail,
    message: err.message
  });
};

const sendUnknownErr = (res: Response<IResError>) => {
  return res.status(500).json({
    status: ResStatus.Error,
    message: 'Something went wrong'
  });
};

const globalErrorMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err);

  let error = err;
  // error.status = error.status || ResStatus.Error;
  error.statusCode = error.statusCode || 500;

  if (error.name === 'ValidationError') error = mongoValidationErr(err);
  if (error.name === 'JsonWebTokenError') error = jwtInvalidTokenErr();
  if (error.name === 'TokenExpiredError') error = jwtTokenExpiredErr();

  if (process.env.NODE_ENV === 'development') return sendDevErr(error, res);
  if (process.env.NODE_ENV === 'production')
    return error.isOperational ? sendProErr(error, res) : sendUnknownErr(res);
};

export default globalErrorMiddleware;
