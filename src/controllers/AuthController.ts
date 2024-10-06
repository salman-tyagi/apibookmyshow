import { Request, Response, NextFunction } from 'express';

import User from '../models/userModel';
import { post, controller, bodyValidator, del, use, get } from './decorators';
import SendMail from '../utils/SendMail';
import { generateJwt, generateOTP } from '../utils/helpers';
import AppError from '../utils/AppError';
import protect from '../middlewares/protect';
import accessAllowedTo from '../middlewares/accessAllowedTo';

import { ILoginReqBody, IReqWithUser, IResBody, ISignupReqBody, ResStatus } from '../types';

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
        user = await User.create<ISignupReqBody>({
          email,
          OTP
        });
      } else {
        if (!user.active)
          return next(new AppError('Your account has been deleted', 401));

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

  @get('/logout')
  @use(protect)
  async logout(
    req: IReqWithUser,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      await User.updateOne(
        { _id: req.user?._id },
        { $set: { verified: false } }
      );

      return res.status(200).json({
        status: ResStatus.Success,
        message: 'User logged out successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  @del('/delete-account')
  @use(protect)
  @use(accessAllowedTo('user'))
  async deleteUser(
    req: IReqWithUser,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const user = await User.findOneAndUpdate(
        { _id: req.user?._id },
        { $set: { active: false, verified: false } }
      );

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

export default AuthController;
