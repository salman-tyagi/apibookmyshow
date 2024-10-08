import { NextFunction, Request, Response } from 'express';

import Booking from '../models/bookingModel';
import { bodyValidator, controller, get, post, use } from './decorators';
import protect from '../middlewares/protect';
import accessAllowedTo from '../middlewares/accessAllowedTo';
import AppError from '../utils/AppError';
import ApiFeatures from '../utils/ApiFeatures';

import { IResBody, ResStatus, IBookingReqBody, IReqParamsWithId, IBookingRequest } from '../types';

@controller('/bookings')
class BookingController {
  @get('/')
  @use(protect)
  @use(accessAllowedTo('admin'))
  async getAllBookings(
    req: Request,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const apiFeatures = new ApiFeatures(Booking.find(), req.query)
        .filter()
        .sort()
        .projection()
        .pagination();

      const bookings = await apiFeatures.query;

      return res.status(200).json({
        status: ResStatus.Success,
        result: bookings.length,
        data: bookings
      });
    } catch (err) {
      next(err);
    }
  }

  @post('/')
  @bodyValidator('movie', 'theatre', 'seatType', 'seats', 'movieDateAndTime', 'ticketPrice')
  @use(protect)
  @use(accessAllowedTo('user'))
  async createBooking(
    req: IBookingRequest,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { movie, theatre, seatType, seats, movieDateAndTime, ticketPrice } =
        req.body;

      const booking = await Booking.create<IBookingReqBody>({
        movie,
        theatre,
        user: req.user._id,
        seatType,
        seats,
        movieDateAndTime,
        ticketPrice
      });

      return res.status(201).json({
        status: ResStatus.Success,
        data: booking
      });
    } catch (err) {
      next(err);
    }
  }

  @get('/:id')
  @use(protect)
  @use(accessAllowedTo('user'))
  async getBooking(
    req: Request<IReqParamsWithId>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide id', 400));

      const booking = await Booking.findOne({ _id: id });
      if (!booking) return next(new AppError('No booking found', 404));

      return res.status(200).json({
        status: ResStatus.Success,
        data: booking
      });
    } catch (err) {
      next(err);
    }
  }
}

export default BookingController;
