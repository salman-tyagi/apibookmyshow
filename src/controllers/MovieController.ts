import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import Movie from '../models/movieModel';
import { get, controller, bodyValidator, post, use, patch, del } from './decorators';
import protect from '../middlewares/protect';
import accessAllowedTo from '../middlewares/accessAllowedTo';
import AppError from '../utils/AppError';
import upload from '../middlewares/multer';
import ApiFeatures from '../utils/ApiFeatures';

import { IMovieReqBody, IReqParamsWithId, IResBody, ResStatus } from '../types';

@controller('/movies')
class MovieController {
  @get('/')
  async getAllMovies(
    req: Request,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const apiFeatures = new ApiFeatures(Movie.find(), req.query)
        .filter()
        .sort()
        .projection()
        .pagination();

      const movies = await apiFeatures.query;

      return res.status(200).json({
        status: ResStatus.Success,
        result: movies.length,
        data: movies
      });
    } catch (err) {
      next(err);
    }
  }

  @post('/')
  @bodyValidator('title', 'languages', 'duration', 'genres', 'certification', 'about', 'cast', 'crew')
  @use(protect)
  @use(accessAllowedTo('admin'))
  async createMovie(
    req: Request<{}, {}, IMovieReqBody>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const movie = await Movie.create<IMovieReqBody>(req.body);

      return res.status(201).json({
        status: ResStatus.Success,
        data: movie
      });
    } catch (err) {
      next(err);
    }
  }

  @get('/:id')
  async getMovie(
    req: Request<IReqParamsWithId>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide id', 400));

      const movie = await Movie.findOne({ _id: id });
      if (!movie) return next(new AppError('No movie found', 404));

      return res.status(200).json({
        status: ResStatus.Success,
        data: movie
      });
    } catch (err) {
      next(err);
    }
  }

  @patch('/:id')
  @use(
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'poster', maxCount: 1 }
    ])
  )
  @use(protect)
  @use(accessAllowedTo('admin'))
  async updateMovie(
    req: Request<IReqParamsWithId>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide id', 400));
      
      const { body } = req;
      
      if (req.files && Object.keys(req.files).length) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        const image = files.image?.at(0)?.filename;
        body.image = image;

        const poster = files.poster?.at(0)?.filename;
        body.poster = poster;
      }

      const movie = await Movie.findOneAndUpdate({ _id: id }, body, {
        runValidators: true,
        new: true
      });

      if (!movie) return next(new AppError('No movie found', 404));

      return res.status(201).json({
        status: ResStatus.Success,
        data: movie
      });
    } catch (err) {
      next(err);
    }
  }

  @del('/:id')
  async deleteMovie(
    req: Request<IReqParamsWithId>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide id', 400));

      const movie = await Movie.findOneAndDelete({ _id: id });
      if (!movie) return next(new AppError('No movie found', 404));

      return res.status(204).json({
        status: ResStatus.Success
      });
    } catch (err) {
      next(err);
    }
  }

  @get('/:id/reviews')
  async getMovieReviews(
    req: Request<IReqParamsWithId>, 
    res: Response<IResBody>, 
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide movie id', 400));

      const reviews = await Movie.aggregate(
        [
          {
            $match: { _id: new Types.ObjectId(id) }
          },
          {
            $lookup: {
              from: 'reviews',
              localField: '_id',
              foreignField: 'movie',
              as: 'reviews'
            }
          },
          {
            $project: {
              reviews: 1
            }
          },
          // {
          //   $sort: { createdAt: -1 }
          // }
          // {
          //   $group: {
          //     _id: '',
          //   }
          // }
        ],
        {}
      );

      return res.status(200).json({
        status: ResStatus.Success,
        result: reviews.length,
        data: reviews
      });
    } catch (err) {
      next(err);      
    }
  }
}

export default MovieController;
