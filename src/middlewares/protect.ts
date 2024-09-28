import { NextFunction, Response } from 'express';

import User from '../models/userModel';
import AppError from '../utils/AppError';
import { verifyJwt } from '../utils/helpers';

import { IReqWithUser } from '../types';

const protect = async (
  req: IReqWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers?.authorization?.split(' ').at(1);
    if (!token) return next(new AppError('You are not logged in', 401));

    const decode = verifyJwt(token, process.env.JWT_SECRET!);

    const user = await User.findOne({ _id: decode.id });
    if (!user) return next(new AppError('No user found with this token', 404));

    if (!user.active)
      return next(new AppError('Account has been deleted', 403));

    if (!user.verified)
      return next(new AppError('Please verify your email', 403));

    req.user = user;
    return next();
  } catch (err) {
    next(err);
  }
};

export default protect;
