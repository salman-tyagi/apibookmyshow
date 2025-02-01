import { NextFunction, Request, Response } from 'express';

import Release from '../models/releaseModel';
import Movie from '../models/movieModel';
import Theatre from '../models/theatreModel';

// prettier-ignore
import { bodyValidator, controller, del, get, patch, post, use } from './decorators';
import protect from '../middlewares/protect';
import accessAllowedTo from '../middlewares/accessAllowedTo';

import AppError from '../utils/AppError';
import ApiFeatures from '../utils/ApiFeatures';
import { createSlug } from '../utils/helpers';

// prettier-ignore
import { ICreateRelease, IMovieSchema, IReleaseReqBody, IReqParamsWithId, IResBody, RecommendedRelease, ResStatus } from '../types';

@controller('/releases')
class ReleaseController {
  @get('/')
  async getAllReleases(
    req: Request,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<Response<IResBody> | undefined> {
    try {
      const apiFeatures = new ApiFeatures(Release.find(), req.query)
        .filter()
        .sort()
        .projection()
        .pagination();

      const releases = await apiFeatures.query.populate({
        path: 'movie theatre',
        select: 'title theatre'
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

  @get('/recommended-releases')
  async getAllRecommendedReleases(
    req: Request,
    res: Response<IResBody>,
    next: NextFunction
  ) {
    try {
      const recommendedReleases = await Release.find<RecommendedRelease>()
        .select('movie slug')
        .populate({
          path: 'movie',
          select: 'title image genres ratingsAverage votes'
        });

      const uniqueReleases = recommendedReleases.reduce(
        (acc: RecommendedRelease[], release) => {
          if (!acc.map(item => item.slug).includes(release.slug))
            acc.push(release);
          return acc;
        },
        []
      );

      return res.status(200).json({
        status: ResStatus.Success,
        result: uniqueReleases.length,
        data: uniqueReleases
      });
    } catch (err) {
      next(err);
    }
  }

  @post('/')
  @bodyValidator('movie', 'theatre', 'screen', 'language', 'price', 'movieDateAndTime')
  @use(protect)
  @use(accessAllowedTo('admin'))
  async createRelease(
    req: Request<{}, {}, IReleaseReqBody>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { movie, theatre, screen, language, price, releaseDate, movieDateAndTime } =
        req.body;

      const _movie = await Movie.findOne({ _id: movie });
      if (!_movie) return next(new AppError('Movie not released', 400));

      const _theatre = await Theatre.findOne({ _id: theatre });
      if (!_theatre) return next(new AppError('Theatre not found', 400));

      const release = await Release.create<ICreateRelease>({
        movie,
        theatre,
        screen,
        language,
        price,
        movieDateAndTime,
        releaseDate,
        slug: createSlug(_movie.title)
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

      const releases = await Release.find({ slug })
        .select('movie screen language releaseDate slug')
        .populate({
          path: 'movie',
          select:
            'title image poster ratingsAverage votes duration genres certification about cast crew'
        })
        .select('-createdAt -__v');

      if (!releases.length) return next(new AppError('No release found', 404));

      const languageAndScreen = {} as { [key: string]: string[] };

      const uniqueRecommendedRelease = releases.reduce(
        (acc: any[], release) => {
          if (!languageAndScreen[release.language])
            languageAndScreen[release.language] = [];

          languageAndScreen[release.language].push(release.screen);

          if (!acc.map(item => item.slug).includes(release.slug)) {
            acc.push({
              _id: release._id,
              movie: release.movie,
              releaseDate: release.releaseDate,
              languageAndScreen,
              slug: release.slug
            });
          }

          return acc;
        },
        []
      );

      return res.status(200).json({
        status: ResStatus.Success,
        result: uniqueRecommendedRelease.length,
        data: uniqueRecommendedRelease[0]
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
    req: Request & {
      params: { movieSlug: string };
      query: { date: string; language: string; screen: string };
    },
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<AppError | Response | void> {
    try {
      const { movieSlug } = req.params;

      if (!movieSlug)
        return next(new AppError('Please provide release movie slug', 400));

      const { date, language, screen } = req.query;

      if (!language || !screen)
        return next(new AppError('Please provide language and screen', 400));

      const pipeline = [
        {
          $match: {
            slug: movieSlug,
            language,
            screen
          }
        },
        {
          $lookup: {
            from: 'movies',
            localField: 'movie',
            foreignField: '_id',
            as: 'movieData'
          }
        },
        {
          $lookup: {
            from: 'theatres',
            localField: 'theatre',
            foreignField: '_id',
            as: 'theatreData'
          }
        },
        {
          $unwind: '$movieDateAndTime'
        },
        {
          $unwind: '$movieData'
        },
        {
          $unwind: '$theatreData'
        },
        {
          $group: {
            _id: '$theatreData.theatre',
            titles: {
              $push: '$movieData.title'
            },
            ratingsQuantities: {
              $push: '$movieData.ratingsQuantity'
            },
            ratingsAverages: {
              $push: '$movieData.ratingsAverage'
            },
            genresArr: {
              $push: '$movieData.genres'
            },
            certifications: {
              $push: '$movieData.certification'
            },
            mTickets: {
              $push: '$theatreData.facilities.mTicket'
            },
            foodAndBeveragesArr: {
              $push: '$theatreData.facilities.foodAndBeverages'
            },
            ticketCancellations: {
              $push: '$theatreData.facilities.ticketCancellation'
            },
            timings: {
              $push: '$movieDateAndTime'
            },
            movieDates: {
              $push: '$movieDateAndTime'
            },
            prices: {
              $push: '$price'
            },
            localities: { $push: '$theatreData.locality' }
          }
        },
        {
          $unwind: '$movieDates'
        }
      ];

      if (date)
        pipeline.push({
          $match: {
            movieDates: {
              $gte: new Date(date),
              $lt: new Date(
                new Date(date).setDate(new Date(date).getDate() + 1)
              )
            }
          }
        });

      pipeline.push(
        {
          $group: {
            _id: '$_id',
            titlesArr: { $push: '$titles' },
            ratingsQuantitiesArr: {
              $push: '$ratingsQuantities'
            },
            ratingsAveragesArr: {
              $push: '$ratingsAverages'
            },
            genresArr: { $push: '$genresArr' },
            certificationsArr: {
              $push: '$certifications'
            },
            mTicketsArr: { $push: '$mTickets' },
            foodAndBeveragesArr: {
              $push: '$foodAndBeveragesArr'
            },
            ticketCancellationsArr: {
              $push: '$ticketCancellations'
            },
            timingsArr: { $push: '$timings' },
            movieDates: { $push: '$movieDates' },
            pricesArr: { $push: '$prices' },
            localitiesArr: { $push: '$localities' }
          }
        },
        {
          $addFields: {
            theatre: '$_id',
            title: { $first: '$titlesArr' },
            ratingsQuantity: {
              $first: '$ratingsQuantitiesArr'
            },
            ratingsAverage: {
              $first: '$ratingsAveragesArr'
            },
            genres: { $first: '$genresArr' },
            certification: {
              $first: '$certificationsArr'
            },
            mTicket: { $first: '$mTicketsArr' },
            foodAndBeverages: {
              $first: '$foodAndBeveragesArr'
            },
            ticketCancellation: {
              $first: '$ticketCancellationsArr'
            },
            timings: {
              $first: '$timingsArr'
            },
            price: { $first: '$pricesArr' },
            locality: { $first: '$localitiesArr' }
          }
        },
        {
          $addFields: {
            title: { $first: '$title' },
            ratingsQuantity: {
              $first: '$ratingsQuantity'
            },
            ratingsAverage: {
              $first: '$ratingsAverage'
            },
            genres: { $first: '$genres' },
            certification: { $first: '$certification' },
            mTicket: { $first: '$mTicket' },
            foodAndBeverages: {
              $first: '$foodAndBeverages'
            },
            ticketCancellation: {
              $first: '$ticketCancellation'
            },
            price: { $first: '$price' },
            locality: { $first: '$locality' },
            filteredMovieDates: '$movieDates'
          }
        },
        {
          $project: {
            _id: 0,
            titlesArr: 0,
            ratingsQuantitiesArr: 0,
            ratingsAveragesArr: 0,
            genresArr: 0,
            certificationsArr: 0,
            mTicketsArr: 0,
            foodAndBeveragesArr: 0,
            ticketCancellationsArr: 0,
            timingsArr: 0,
            movieDates: 0,
            pricesArr: 0,
            localitiesArr: 0
          }
        },
        {
          $sort: { theatre: -1 }
        }
      );

      const releaseTheatres = await Release.aggregate(pipeline);

      if (!releaseTheatres.length)
        return next(
          new AppError('Invalid language or screen, no theatre found for this release', 404)
        );

      return res.status(200).json({
        status: ResStatus.Success,
        result: releaseTheatres.length,
        data: releaseTheatres
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
