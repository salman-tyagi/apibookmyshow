import { ResponseStatus } from './enums';

type Role = 'admin' | 'user';
type Identity = 'man' | 'woman';

// Model interfaces
export interface IUserSchema {
  firstName: string;
  lastName: string;
  email: string;
  OTP: number;
  mobile: number;
  role: Role;
  active: boolean;
  verified: boolean;
  personalDetails: { birthday: Date; identity: Identity; married: boolean };
  address: {
    city: string;
    state: string;
    pincode: number;
    landmark: string;
    address: string;
  };
  createdAt: Date;
}

// Controller interfaces
export interface ISignupRequestBody {
  email: string;
}

export interface IResponseBody {
  status: ResponseStatus.Success;
  result?: number;
  message?: string;
  data?: Partial<IUserSchema>;
}

// Mail interface
export interface MailOptions {
  email: string;
  name?: string;
  link?: string;
  OTP?: number;
}
