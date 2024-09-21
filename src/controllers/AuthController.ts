import { Request, Response, NextFunction } from 'express';

import User from '../models/userModel';
import { post, controller, bodyValidator } from './decorators';
import SendMail from '../utils/SendMail';
import { generateJwt, generateOTP } from '../utils/helpers';
import AppError from '../utils/AppError';

import {
  ILoginReqBody,
  IResBody,
  ISignupReqBody,
  IUserSchema,
  ResStatus
} from '../types';

@controller('/auth')
class AuthController {
  @post('/signup')
  @bodyValidator('email')
  async signup(
    req: Request<{}, {}, ISignupReqBody>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { email } = req.body;
      const OTP = generateOTP();

      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create<Partial<IUserSchema>>({
          email,
          OTP
        });
      } else {
        user.OTP = OTP;
        user.verified = false;
        await user.save({ validateBeforeSave: true });
      }

      SendMail.verifyEmail({ email: user.email, OTP });

      return res.status(201).json({
        status: ResStatus.Success,
        message: 'OTP sent! Please verify your email'
      });
    } catch (err) {
      next(err);
    }
  }

  @post('/login')
  @bodyValidator('email', 'OTP')
  async login(
    req: Request<{}, {}, ILoginReqBody>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { email, OTP } = req.body;

      const user = await User.findOneAndUpdate(
        { email, OTP },
        { $set: { verified: true }, $unset: { OTP: '' } },
        { runValidators: true, new: true }
      );

      if (!user) return next(new AppError('Incorrect email or OTP', 401));

      const token = generateJwt(
        user._id,
        process.env.JWT_SECRET!,
        process.env.JWT_EXPIRES_IN!
      );

      return res.status(201).json({
        status: ResStatus.Success,
        token
        // data: user
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
