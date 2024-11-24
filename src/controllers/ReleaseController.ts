import { NextFunction, Request, Response } from 'express';
import slugify from 'slugify';

import Release from '../models/releaseModel';
import Movie from '../models/movieModel';

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
        path: 'movie',
        select: 'title ratingsAverage votes genres image slug'
      });

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

      const _movie = await Movie.findOne({ _id: movie });
      if (!_movie) return next(new AppError('Movie not released', 400));

      const slug = slugify(_movie.title, { lower: true, strict: true });

      const release = await Release.create<IReleaseReqBody>({
        movie,
        theatre,
        releaseDate,
        screen,
        movieDateAndTime,
        slug
      });

      return res.status(201).json({
        status: ResStatus.Success,
        data: release
      });
    } catch (err) {
      next(err);
    }
  }

  @get('/:slug')
  async getRelease(
    req: Request<{ slug: string }>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { slug } = req.params;
      if (!slug) return next(new AppError('Please provide slug', 400));

      const apiFeatures = new ApiFeatures(Release.findOne({ slug }), req.query)
        .filter()
        .sort()
        .projection()
        .pagination();

      const release = await apiFeatures.query.populate({
        path: 'movie',
        select: 'title image poster duration genres languages certification'
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

  @get('/theatres/:movieSlug')
  async getReleaseTheatres(
    req: Request<{ movieSlug: string }, {}, {}, { dateString: string }>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { movieSlug } = req.params;
      if (!movieSlug)
        return next(new AppError('Please provide release movie slug', 400));

      const { dateString } = req.query;

      if (!dateString)
        return next(new AppError('Please provide release date', 400));

      const release = await Release.aggregate([
        {
          $match: {
            slug: movieSlug
          }
        },
        {
          $unwind: '$movieDateAndTime'
        },
        {
          $match: {
            movieDateAndTime: {
              $gte: new Date(new Date(dateString).toDateString()),
              $lt: new Date(
                new Date(
                  new Date(dateString).setDate(
                    new Date(dateString).getDate() + 1
                  )
                ).toDateString()
              )
            }
          }
        },
        {
          $lookup: {
            from: 'movies',
            localField: 'movie',
            foreignField: '_id',
            as: 'movie',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  title: 1,
                  certification: 1,
                  genres: 1
                }
              }
            ]
          }
        },

        {
          $lookup: {
            from: 'theatres',
            localField: 'theatre',
            foreignField: '_id',
            as: 'theatre',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  theatre: 1,
                  locality: 1,
                  facilities: 1
                }
              }
            ]
          }
        },
        {
          $project: {
            movie: {
              $first: '$movie'
            },
            theatre: {
              $first: '$theatre'
            },
            // releaseDate: 1,
            screen: 1,
            movieDateAndTime: 1,
            slug: 1
          }
        },
        {
          $sort: {
            movieDateAndTime: 1
          }
        }
      ]);

      if (!release) return next(new AppError('No release found', 404));

      return res.status(200).json({
        status: ResStatus.Success,
        result: release.length,
        data: release
      });
    } catch (err) {
      next(err);
    }
  }
}

export default ReleaseController;
