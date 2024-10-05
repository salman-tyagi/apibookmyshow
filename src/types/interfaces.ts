import { Types } from 'mongoose';
import { Request } from 'express';

import AppError from '../utils/AppError';

import { ResStatus } from './enums';
import { Identity, MultiplexChain, Role, Seat } from './typeAlias';

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
  ratingsQuantity: number;
  ratingsAverage: number;
  votes: number;
  genres: string[];
  certification: string;
  about: string;
  cast: { actor: string[]; actress: string[] };
  crew: {
    director: string[];
    actionDirector: string[];
    producer: string[];
    creativeProducer: string[];
    executiveProducer: string[];
    cinematographer: string[];
    editor: string[];
    writer: string[];
    musician: string[];
    singer: string[];
    lyricist: string[];
    screenplay: string[];
  };
  createdAt: Date;
}

export interface IMovieReqBody {
  title: string;
  languages: string[];
  duration: number;
  genres: string[];
  certification: string;
  about: string;
  cast: { actor: string[]; actress: string[] };
  crew: {
    director: string[];
    actionDirector: string[];
    producer: string[];
    creativeProducer: string[];
    executiveProducer: string[];
    cinematographer: string[];
    editor: string[];
    writer: string[];
    musician: string[];
    singer: string[];
    lyricist: string[];
    screenplay: string[];
  };
}

export interface ITheatreSchema {
  theatre: string;
  multiplexChain: MultiplexChain;
  location: { lat: number; lng: number };
  address: string;
  locality: string;
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
  seats: {
    vip: string[];
    executive: string[];
    normal: string[];
  };
  createdAt: Date;
}

export interface ITheatreReqBody {
  theatre: string;
  multiplexChain: MultiplexChain;
  location: { lat: number; lng: number };
  address: string;
  locality: string;
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
  seats: {
    vip: string[];
    executive: string[];
    normal: string[];
  };
}

export interface IReleaseSchema {
  movie: Types.ObjectId;
  theatres: Types.ObjectId;
  releaseDate: Date;
  timings: [Date];
  createdAt: Date;
}

export interface IReleaseReqBody {
  movie: Types.ObjectId;
  theatres: Types.ObjectId;
  releaseDate: Date;
  timings: [Date];
}

export interface IBookingSchema {
  movie: Types.ObjectId;
  theatre: Types.ObjectId;
  seatType: Seat;
  seats: string[];
  ticketPrice: number;
  showDate: Date;
  showTime: Date;
  createdAt: Date;
}

export interface IBookingReqBody {
  movie: Types.ObjectId;
  theatre: Types.ObjectId;
  seatType: Seat;
  seats: string[];
  ticketPrice: number;
  showDate: Date;
  showTime: Date;
}

export interface IReviewSchema {
  review: string;
  rating: number;
  movie: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
}

export interface IReqParamsWithId {
  id: Types.ObjectId;
}

export interface IReviewReqBody {
  review: string;
  rating: number;
}

export interface ICreateReviewRequest extends Request {
  params: { id: string };
  body: IReviewReqBody;
  user: IUserSchema;
}

export interface IResBody {
  status: ResStatus.Success;
  result?: number;
  token?: string;
  message?: string;
  // data?: ResData;
  data?: any;
}

export interface IReqWithUser extends Request {
  user?: IUserSchema;
}

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
