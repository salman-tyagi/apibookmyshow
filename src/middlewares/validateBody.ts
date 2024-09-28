import { NextFunction, Request, RequestHandler, Response } from 'express';

import AppError from '../utils/AppError';

const validateBody = (fields: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body) {
      return next(new AppError('Invalid request', 400));
    }

    for (const field of fields) {
      if (!req.body[field]) {
        return next(new AppError(`${field} is required`, 400));
      }
    }

    return next();
  };
};

export default validateBody;
