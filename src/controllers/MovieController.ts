import { NextFunction, Request, Response } from 'express';

import Movie from '../models/movieModel';
import {
  get,
  controller,
  bodyValidator,
  post,
  use,
  patch,
  del
} from './decorators';
import protect from '../middlewares/protect';
import accessAllowedTo from '../middlewares/accessAllowedTo';
import AppError from '../utils/AppError';

import {
  IMovieReqBody,
  IMovieSchema,
  IReqBodyWithId,
  IResBody,
  ResStatus
} from '../types';

@controller('/movies')
class MovieController {
  @get('/')
  async getAllMovies(
    req: Request,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const movies = await Movie.find();

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
  @bodyValidator(
    'title',
    'languages',
    'duration',
    'genres',
    'screen',
    'certification',
    'releaseDate',
    'about',
    'cast',
    'crew'
  )
  @use(protect)
  @use(accessAllowedTo('admin'))
  async createMovie(
    req: Request<{}, {}, IMovieReqBody>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const movie = await Movie.create<Partial<IMovieSchema>>(req.body);

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
    req: Request<IReqBodyWithId>,
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
  async updateMovie(
    req: Request<IReqBodyWithId>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide id', 400));

      const movie = await Movie.findOneAndUpdate({ _id: id }, req.body, {
        runValidators: true,
        new: true
      });

      if (!movie) return next(new AppError('No movie found', 404));

      return res.status(200).json({
        status: ResStatus.Success,
        data: movie
      });
    } catch (err) {
      next(err);
    }
  }

  @del('/:id')
  async deleteMovie(
    req: Request<IReqBodyWithId>,
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
}

export default MovieController;
