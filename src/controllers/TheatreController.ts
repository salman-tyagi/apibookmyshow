import { NextFunction, Request, Response } from 'express';

import Theatre from '../models/theatreModel';
import { bodyValidator, controller, del, get, patch, post, use } from './decorators';
import protect from '../middlewares/protect';
import accessAllowedTo from '../middlewares/accessAllowedTo';
import AppError from '../utils/AppError';

import { ITheatreReqBody, ITheatreSchema, IResBody, ResStatus, IReqParamsWithId } from '../types';

@controller('/theatres')
class TheatreController {
  @get('/')
  async getAllTheatres(
    req: Request,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const theatres = await Theatre.find();

      return res.status(200).json({
        status: ResStatus.Success,
        result: theatres.length,
        data: theatres
      });
    } catch (err) {
      next(err);
    }
  }

  @post('/')
  @bodyValidator('theatre', 'multiplexChain', 'location', 'address', 'locality', 'city', 'state', 'pincode', 'region', 'country', 'facilities', 'seats')
  @use(protect)
  @use(accessAllowedTo('admin'))
  async createTheatre(
    req: Request<{}, {}, ITheatreReqBody>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const theatre = await Theatre.create<ITheatreReqBody>(req.body);

      return res.status(201).json({
        status: ResStatus.Success,
        data: theatre
      });
    } catch (err) {
      next(err);
    }
  }

  @get('/:id')
  async getTheatre(
    req: Request<IReqParamsWithId>, 
    res: Response<IResBody>, 
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide id', 400));

      const theatre = await Theatre.findOne({ _id: id });
      if (!theatre) return next(new AppError('Theatre not found', 404));

      return res.status(200).json({
        status: ResStatus.Success,
        data: theatre
      });
    } catch(err) {
      next(err);
    }
  }

  @patch('/:id')
  @use(protect)
  @use(accessAllowedTo('admin'))
  async updateTheatre(
    req: Request<IReqParamsWithId, {}, ITheatreSchema>, 
    res: Response<IResBody>, 
    next: NextFunction
  ):Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide id', 400));

      if (!Object.values(req.body).length)
        return next(new AppError('Please provide request body', 400));

      const theatre = await Theatre.findOneAndUpdate(
        { _id: id },
        { $set: req.body },
        { runValidators: true, new: true }
      );

      if (!theatre) return next(new AppError('Theatre not found', 404));
      
      return res.status(201).json({
        status: ResStatus.Success,
        data: theatre
      });
    } catch(err) {
      next(err);
    }
  };

  @del('/:id')
  @use(protect)
  @use(accessAllowedTo('admin'))
  async deleteTheatre(
    req: Request<IReqParamsWithId>, 
    res: Response<IResBody>, 
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide id', 400));

      const theatre = await Theatre.findOneAndDelete({ _id: id });
      if (!theatre) return next(new AppError('No theatre found', 404));

      return res.status(204).json({
        status: ResStatus.Success,
        message: 'Theatre deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  };
}

export default TheatreController;
