import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

export const generateOTP = (): number => {
  return parseInt(
    Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0')
  );
};

export const generateJwt = (
  id: Types.ObjectId,
  secretKey: string,
  timeToExpire: string
) => jwt.sign({ id }, secretKey, { expiresIn: timeToExpire });
