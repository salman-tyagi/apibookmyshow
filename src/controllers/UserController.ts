import { NextFunction, Request, Response } from 'express';

import User from '../models/userModel';
import { get, controller, del, use } from './decorators';
import AppError from '../utils/AppError';
import protect from '../middlewares/protect';
import accessAllowedTo from '../middlewares/accessAllowedTo';

import { IReqParamsWithId, IResBody, ResStatus } from '../types';

@controller('/users')
class UserController {
  @get('/')
  @use(protect)
  @use(accessAllowedTo('admin'))
  async getAllUsers(
    req: Request,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const users = await User.find();

      return res.status(200).json({
        status: ResStatus.Success,
        result: users.length,
        data: users
      });
    } catch (err) {
      next(err);
    }
  }

  @get('/:id')
  async getUser(
    req: Request<IReqParamsWithId>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) next(new AppError('User id is required', 404));

      const user = await User.findOne({ _id: id });
      if (!user) return next(new AppError('No user found', 404));

      return res.status(200).json({
        status: ResStatus.Success,
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

  @del('/:id')
  @use(protect)
  @use(accessAllowedTo('admin'))
  async deleteUser(
    req: Request<IReqParamsWithId>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) next(new AppError('User id is required', 404));

      const user = await User.findOneAndDelete({ _id: id });
      if (!user) return next(new AppError('No user found', 404));

      return res.status(204).json({
        status: ResStatus.Success,
        message: 'User deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

export default UserController;
