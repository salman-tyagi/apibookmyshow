import { NextFunction, Request, Response } from 'express';

import Movie from '../models/movieModel';
import { get, controller, bodyValidator, post, use } from './decorators';
import protect from '../middlewares/protect';
import accessAllowedTo from '../middlewares/accessAllowedTo';

import { IMovieReqBody, IMovieSchema, IResBody, ResStatus } from '../types';

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
  @bodyValidator('title', 'languages', 'duration', 'genres', 'releaseDate', 'about', 'cast', 'crew')
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
    } catch(err) {
      next(err);
    }
  }
}

export default MovieController;
