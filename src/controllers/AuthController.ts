import { Request, Response, NextFunction } from 'express';

import User from '../models/userModel';
import { post, controller, bodyValidator } from './decorators';
import SendMail from '../utils/SendMail';
import { generateOTP } from '../utils/helpers';

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

      const OTP = generateOTP();

      const user = await User.create<Pick<IUserSchema, 'email' | 'OTP'>>({
        email,
        OTP
      });

      SendMail.verifyEmail({ email: user.email, OTP });

      return res.status(201).json({
        status: ResponseStatus.Success,
        message: 'Email sent successfully. Please verify your email'
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
