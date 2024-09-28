import { NextFunction, Request, Response } from 'express';

import Cinema from '../models/cinemaModel';
import { bodyValidator, controller, del, get, patch, post, use } from './decorators';
import protect from '../middlewares/protect';
import accessAllowedTo from '../middlewares/accessAllowedTo';
import { Types } from 'mongoose';
import AppError from '../utils/AppError';

import { ICinemaReqBody, ICinemaSchema, IResBody, ResStatus } from '../types';

@controller('/cinemas')
class CinemaController {
  @get('/')
  async getAllCinemas(
    req: Request,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const cinemas = await Cinema.find();

      return res.status(200).json({
        status: ResStatus.Success,
        result: cinemas.length,
        data: cinemas
      });
    } catch (err) {
      next(err);
    }
  }

  @post('/')
  @bodyValidator('name', 'multiplexChain', 'location', 'address', 'city', 'state', 'pincode', 'region', 'country', 'facilities')
  @use(protect)
  @use(accessAllowedTo('admin'))
  async createCinema(
    req: Request<{}, {}, ICinemaReqBody>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const cinema = await Cinema.create<ICinemaReqBody>(req.body);

      return res.status(201).json({
        status: ResStatus.Success,
        data: cinema
      });
    } catch (err) {
      next(err);
    }
  }

  @get('/:id')
  async getCinema(
    req: Request<{ id: Types.ObjectId }>, 
    res: Response<IResBody>, 
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide id', 400));

      const cinema = await Cinema.findOne({ _id: id });
      if (!cinema) return next(new AppError('Cinema not found', 404));

      return res.status(200).json({
        status: ResStatus.Success,
        data: cinema
      });
    } catch(err) {
      next(err);
    }
  }

  @patch('/:id')
  @use(protect)
  @use(accessAllowedTo('admin'))
  async updateCinema(
    req: Request<{ id: Types.ObjectId }, {}, ICinemaSchema>, 
    res: Response<IResBody>, 
    next: NextFunction
  ):Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide id', 400));

      if (!Object.values(req.body).length)
        return next(new AppError('Please provide request body', 400));

      const cinema = await Cinema.findOneAndUpdate(
        { _id: id },
        { $set: req.body },
        { runValidators: true, new: true }
      );

      if (!cinema) return next(new AppError('Cinema not found', 404));
      
      return res.status(201).json({
        status: ResStatus.Success,
        data: cinema
      });
    } catch(err) {
      next(err);
    }
  };

  @del('/:id')
  @use(protect)
  @use(accessAllowedTo('admin'))
  async deleteCinema(
    req: Request<{ id: Types.ObjectId }>, 
    res: Response<IResBody>, 
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide id', 400));

      const cinema = await Cinema.findOneAndDelete({ _id: id });
      if (!cinema) return next(new AppError('No cinema found', 404));

      return res.status(204).json({
        status: ResStatus.Success,
        message: 'Cinema deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  };
}

export default CinemaController;
