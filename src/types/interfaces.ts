import { ResponseStatus } from './enums';

export interface IUserSchema {
  email: string;
  OTP: number;
  createdAt: Date;
}

export interface ISignupRequestBody {
  email: string;
}

export interface IResponseBody {
  status: ResponseStatus.Success;
  result?: number;
  message?: string;
  data?: Partial<IUserSchema>;
}
