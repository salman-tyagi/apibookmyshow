import { Types } from 'mongoose';
import { Request } from 'express';

import AppError from '../utils/AppError';

import { ResData, ResStatus } from './enums';

type Role = 'admin' | 'user';
type Identity = 'man' | 'woman';
type MultiplexChain = 'inox' | 'pvr' | 'cinepolis';

// Model interfaces
export interface IUserSchema {
  _id: Types.ObjectId;
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
export interface ISignupReqBody {
  email: string;
}

export interface ILoginReqBody {
  email: string;
  OTP: number;
}

export interface IMovieSchema {
  title: string;
  image: string;
  poster: string;
  languages: string[];
  duration: number; // in mins
  review: string;
  ratingsQuantity: number;
  ratingsAverage: number;
  likes: number;
  genres: string[];
  screen: string[];
  certification: string;
  releaseDate: Date;
  about: string;
  cast: { actor: string[]; actress: string[] };
  crew: {
    director: string[];
    producer: string[];
    executiveProducer: string[];
    cinematographer: string[];
    editor: string[];
    writer: string[];
    musician: string[];
    screenplay: string[];
  };
  createdAt: Date;
}

export interface IMovieReqBody {
  title: string;
  languages: string[];
  duration: number;
  genres: string[];
  screen: string[];
  certification: string;
  releaseDate: Date;
  about: string;
  cast: { actor: string[]; actress: string[] };
  crew: {
    director: string[];
    producer: string[];
    executiveProducer: string[];
    cinematographer: string[];
    editor: string[];
    writer: string[];
    musician: string[];
    screenplay: string[];
  };
}

export interface ICinemaSchema {
  name: string;
  // screen: string[];
  multiplexChain: MultiplexChain;
  movies: string[];
  location: { lat: number; lng: number };
  address: string;
  city: string;
  state: string;
  pincode: number;
  region: string;
  country: string;
  facilities: {
    ticketCancellation: boolean;
    foodAndBeverages: boolean;
    mTicket: boolean;
    wheelChair: boolean;
    parking: boolean;
    foodCourt: boolean;
  };
}

export interface ICinemaReqBody {
  name: string;
  // screen: string[];
  multiplexChain: MultiplexChain;
  // movies: string[];
  location: { lat: number; lng: number };
  address: string;
  city: string;
  state: string;
  pincode: number;
  region: string;
  country: string;
  facilities: {
    ticketCancellation: boolean;
    foodAndBeverages: boolean;
    mTicket: boolean;
    wheelChair: boolean;
    parking: boolean;
    foodCourt: boolean;
  };
}

export interface IReqBodyWithId {
  id: Types.ObjectId;
}

export interface IResBody {
  status: ResStatus.Success;
  result?: number;
  token?: string;
  message?: string;
  data?: ResData;
}

// Middleware interfaces
export interface IReqWithUser extends Request {
  user?: IUserSchema;
}

// Mail interface
export interface MailOptions {
  email: string;
  name?: string;
  link?: string;
  OTP?: number;
}

export interface IResError {
  status: string;
  message: string;
  error?: AppError;
  stack?: string;
}
