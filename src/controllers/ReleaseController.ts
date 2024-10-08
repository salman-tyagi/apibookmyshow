import { NextFunction, Request, Response } from 'express';

import Release from '../models/releaseModel';
import { bodyValidator, controller, del, get, patch, post, use } from './decorators';
import protect from '../middlewares/protect';
import accessAllowedTo from '../middlewares/accessAllowedTo';
import AppError from '../utils/AppError';
import ApiFeatures from '../utils/ApiFeatures';

import { IReleaseReqBody, IReqParamsWithId, IResBody, ResStatus } from '../types';

@controller('/releases')
class ReleaseController {
  @get('/')
  async getAllReleases(
    req: Request,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const apiFeatures = new ApiFeatures(Release.find(), req.query)
        .filter()
        .sort()
        .projection()
        .pagination();

      const releases = await apiFeatures.query.populate({
        path: 'movie theatre',
        select: 'title theatre locality'
      })

      return res.status(200).json({
        status: ResStatus.Success,
        result: releases.length,
        data: releases
      });
    } catch (err) {
      next(err);
    }
  }

  @post('/')
  @bodyValidator('movie', 'theatre', 'releaseDate', 'screen', 'movieDateAndTime')
  @use(protect)
  @use(accessAllowedTo('admin'))
  async createRelease(
    req: Request<{}, {}, IReleaseReqBody>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { movie, theatre, releaseDate, screen, movieDateAndTime } =
        req.body;

      const release = await Release.create<IReleaseReqBody>({
        movie,
        theatre,
        releaseDate,
        screen,
        movieDateAndTime
      });

      return res.status(201).json({
        status: ResStatus.Success,
        data: release
      });
    } catch (err) {
      next(err);
    }
  }

  @get('/:id')
  async getRelease(
    req: Request<IReqParamsWithId>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide id', 400));

      const release = await Release.findOne({ _id: id }).populate({
        path: 'movie theatre',
        select: 'title theatre locality'
      });

      if (!release) return next(new AppError('No release found', 404));

      return res.status(200).json({
        status: ResStatus.Success,
        data: release
      });
    } catch (err) {
      next(err);
    }
  }

  @patch('/:id')
  @use(protect)
  @use(accessAllowedTo('admin'))
  async updateRelease(
    req: Request<IReqParamsWithId, {}, IReleaseReqBody>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide id', 400));

      const { movie, theatre, releaseDate, screen, movieDateAndTime } =
        req.body;
        

      if (!movie && !theatre && !releaseDate && !screen && !movieDateAndTime)
        return next(
          new AppError(
            'Please provide movie, theatre, releaseDate, screen and movieDateAndTime',
            400
          )
        );

      const release = await Release.findOneAndUpdate(
        { _id: { $eq: id } },
        { $set: { movie, theatre, releaseDate, screen, movieDateAndTime } },
        { runValidators: true, new: true }
      );

      if (!release) return next(new AppError('No release found', 404));

      return res.status(201).json({
        status: ResStatus.Success,
        data: release
      });
    } catch (err) {
      next(err);
    }
  }

  @del('/:id')
  @use(protect)
  @use(accessAllowedTo('admin'))
  async deleteRelease(
    req: Request<IReqParamsWithId>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide id', 400));

      const release = await Release.findOneAndDelete({ _id: id });
      if (!release) return next(new AppError('No release found', 404));

      return res.status(204).json({
        status: ResStatus.Success
      });
    } catch (err) {
      next(err);
    }
  }
}

export default ReleaseController;
