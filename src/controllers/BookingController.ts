import { NextFunction, Request, Response } from 'express';

import Booking from '../models/bookingModel';
import { bodyValidator, controller, get, post, use } from './decorators';
import protect from '../middlewares/protect';
import accessAllowedTo from '../middlewares/accessAllowedTo';
import AppError from '../utils/AppError';

import { IResBody, ResStatus, IBookingReqBody, IReqParamsWithId } from '../types';

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
      const bookings = await Booking.find();

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
  @bodyValidator('movie', 'theatre', 'seats', 'price', 'showDate', 'showTime')
  @use(protect)
  @use(accessAllowedTo('user'))
  async createBooking(
    req: Request<{}, {}, IBookingReqBody>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const booking = await Booking.create<IBookingReqBody>(req.body);

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
  @use(accessAllowedTo('admin'))
  async getBooking(
    req: Request<IReqParamsWithId>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next (new AppError('Please provide id', 400));

      const booking = await Booking.findOne({ _id: id }).populate({
        path: 'movie theatre',
        select: 'title theatre address locality city state pincode'
      });
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