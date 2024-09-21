import { Request, Response, NextFunction } from 'express';

import User from '../models/userModel';
import { post, controller, bodyValidator } from './decorators';

import {
  IResponseBody,
  ISignupRequestBody,
  IUserSchema,
  ResponseStatus
} from '../types';

@controller('/auth')
class AuthController {
  @post('/signup')
  @bodyValidator('email')
  async signup(
    req: Request<ISignupRequestBody>,
    res: Response<IResponseBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { email } = req.body;

      const user = await User.create<Pick<IUserSchema, 'email'>>({ email });

      return res.status(200).json({
        status: ResponseStatus.Success,
        data: user
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
