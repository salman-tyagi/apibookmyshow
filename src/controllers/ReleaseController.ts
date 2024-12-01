import { NextFunction, Request, Response } from 'express';
import slugify from 'slugify';

import Release from '../models/releaseModel';
import Movie from '../models/movieModel';

// prettier-ignore
import { bodyValidator, controller, del, get, patch, post, use } from './decorators';
import protect from '../middlewares/protect';
import accessAllowedTo from '../middlewares/accessAllowedTo';
import AppError from '../utils/AppError';
import ApiFeatures from '../utils/ApiFeatures';

// prettier-ignore
import { IMovieSchema, IReleaseReqBody, IReqParamsWithId, IResBody, ResStatus } from '../types';

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
  @bodyValidator(
    'movie',
    'theatre',
    'releaseDate',
    'screen',
    'movieDateAndTime'
  )
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

      const release = await Release.findOne({ slug })
        .populate({
          path: 'movie',
          select:
            'title image poster ratingsAverage votes duration genres languages certification about cast crew'
        })
        .select('-createdAt -__v');

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
    req: Request<
      { movieSlug: string },
      {},
      {},
      { dateString: string; screen: string }
    >,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { movieSlug } = req.params;
      if (!movieSlug)
        return next(new AppError('Please provide release movie slug', 400));

      const { dateString, screen = '2d' } = req.query;

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
          $unwind: '$screen'
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
            },
            screen
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
            movie: { $first: '$movie' },
            theatre: { $first: '$theatre' },
            screen: 1,
            movieDateAndTime: 1,
            releaseDate: 1
          }
        },
        {
          $group: {
            _id: '$theatre.theatre',
            movieTitle: {
              $push: '$movie.title'
            },
            releaseDate: {
              $push: '$releaseDate'
            },
            certification: {
              $push: '$movie.certification'
            },
            genres: {
              $push: '$movie.genres'
            },
            timings: {
              $push: '$movieDateAndTime'
            },
            facilities: {
              $push: '$theatre.facilities'
            },
            locality: {
              $push: '$theatre.locality'
            }
          }
        },
        {
          $addFields: {
            theatre: '$_id'
          }
        },
        {
          $project: {
            _id: 0,
            theatre: 1,
            movieTitle: { $first: '$movieTitle' },
            certification: { $first: '$certification' },
            genres: { $first: '$genres' },
            releaseDate: { $first: '$releaseDate' },
            timings: 1,
            facilities: { $first: '$facilities' },
            locality: { $first: '$locality' }
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

  @get('/:movieSlug/related-releases')
  async getRelatedReleases(
    req: Request<{ movieSlug: string }>,
    res: Response<IResBody>,
    next: NextFunction
  ) {
    try {
      const { movieSlug } = req.params;
      if (!movieSlug)
        return next(new AppError('Please provide movie slug', 400));

      const movie = await Movie.findOne<IMovieSchema>({ slug: movieSlug });
      if (!movie)
        return next(new AppError('No movie found with this slug', 404));

      const movies = await Movie.find<IMovieSchema>(
        {
          genres: { $in: movie.genres }
        },
        {},
        { limit: 11 } // Why 11? because to show only limited results
      );

      const releasePromises = movies.map(async movie => {
        const release = await Release.findOne({
          movie: movie._id
        })
          .populate({
            path: 'movie',
            select: 'image title ratingsAverage votes slug'
          })
          .select('movie');

        return release;
      });

      const relatedReleases = (await Promise.all(releasePromises)).filter(
        release => release
      );

      return res.status(200).json({
        status: ResStatus.Success,
        result: relatedReleases.length,
        data: relatedReleases
      });
    } catch (err) {
      next(err);
    }
  }
}

export default ReleaseController;
