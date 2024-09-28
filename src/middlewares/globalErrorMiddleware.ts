import { Request, Response, NextFunction } from 'express';

import AppError from '../utils/AppError';
import { IResError, ResStatus } from '../types';

const mongoDuplicateErr = (err: any) => {
  const message = `Duplicate ${Object.keys(err.errorResponse.keyPattern).join(
    ', '
  )} is not allowed`;

  return new AppError(message, 404);
};

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
    status: err.status,
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
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err);

  err.status = err.status || ResStatus.Error;
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') return sendDevErr(err, res);

  if (process.env.NODE_ENV === 'production') {
    let error = err;

    if (error.name === 'ValidationError') error = mongoValidationErr(err);
    if (error.code === 11000) error = mongoDuplicateErr(err);
    if (error.name === 'JsonWebTokenError') error = jwtInvalidTokenErr();
    if (error.name === 'TokenExpiredError') error = jwtTokenExpiredErr();

    return error.isOperational ? sendProErr(error, res) : sendUnknownErr(res);
  }
};

export default globalErrorMiddleware;
