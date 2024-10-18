import { Types } from 'mongoose';
import { Request } from 'express';

import AppError from '../utils/AppError';

import { ResStatus } from './enums';
import { Identity, MultiplexChain, Role, Screen, Seat } from './typeAlias';

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
    vip: { row: number; column: number };
    executive: { row: number; column: number };
    normal: { row: number; column: number };
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
    vip: { row: number; column: number };
    executive: { row: number; column: number };
    normal: { row: number; column: number };
  };
}

export interface IReleaseSchema {
  movie: Types.ObjectId;
  theatre: Types.ObjectId;
  releaseDate: Date;
  screen: Screen[];
  movieDateAndTime: Date[];
  createdAt: Date;
}

export interface IReleaseReqBody {
  movie: Types.ObjectId;
  theatre: Types.ObjectId;
  releaseDate: Date;
  screen: Screen[];
  movieDateAndTime: Date[];
}

export interface IBookingSchema {
  user: Types.ObjectId;
  movie: Types.ObjectId;
  theatre: Types.ObjectId;
  seatType: Seat;
  seats: { row: number; column: number }[];
  movieDateAndTime: Date;
  ticketPrice: number;
  createdAt: Date;
}

export interface IBookingReqBody {
  movie: Types.ObjectId;
  theatre: Types.ObjectId;
  seatType: Seat;
  seats: { row: number; column: number }[];
  movieDateAndTime: Date;
  ticketPrice: number;
}

export interface IBookingRequest extends Request {
  user: Types.ObjectId;
  body: IBookingReqBody;
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

export interface IReviewRequest extends Request { // Using with delete review
  params: { id: string };
  body: IReviewReqBody;
  user: IUserSchema;
}

export interface ICitySchema {
  city: string;
  image: string;
  createdAt: Date;
}

export interface ICityReqBody {
  city: string;
  // image: string;
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

export interface IMovieReviewStats {
  numReviews: number;
  avgReviews: number;
}