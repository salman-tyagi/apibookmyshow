import { NextFunction, Request, RequestHandler, Response } from 'express';
import AppError from '../utils/AppError';

const validateParams = (params: string[]): RequestHandler => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.params) {
      return next(new AppError('Invalid request', 400));
    }

    for (const param of params) {
      if (!req.params[param]) {
        return next(new AppError(`${param} is required`, 400));
      }
    }

    return next();
  };
};

export default validateParams;
