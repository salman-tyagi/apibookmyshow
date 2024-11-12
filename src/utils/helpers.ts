import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

export const generateOTP = (): number => {
  return parseInt(
    Math.floor(Math.random() * 1000000)
      .toString()
      .padEnd(6, '0')
  );
};

export const generateJwt = (
  id: Types.ObjectId,
  secretKey: string,
  timeToExpire: string
) => jwt.sign({ id }, secretKey, { expiresIn: timeToExpire });

export const verifyJwt = <T = jwt.JwtPayload>(
  token: string,
  secretKey: string
): T => jwt.verify(token, secretKey) as T;
