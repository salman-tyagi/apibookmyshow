import { Response, NextFunction, RequestHandler } from 'express';

import AppError from '../utils/AppError';

import { IReqWithUser } from '../types';

const accessAllowedTo = (...roles: string[]): RequestHandler => {
  return (req: IReqWithUser, res: Response, next: NextFunction): void => {
    try {
      if (!roles.includes(req.user!.role))
        return next(new AppError('You are forbidden to get access', 403));

      return next();
    } catch (err) {
      next(err);
    }
  };
};

export default accessAllowedTo;
