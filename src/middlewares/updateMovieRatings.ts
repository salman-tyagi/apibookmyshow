import { CallbackWithoutResultAndOptionalError, Types } from 'mongoose';

import Movie from '../models/movieModel';
import AppError from '../utils/AppError';

import { IMovieReviewStats, IReviewSchema } from '../types';

export const updateMovieRatings = async function (
  currentReview: IReviewSchema,
  next: CallbackWithoutResultAndOptionalError
): Promise<void> {
  try {
    if (!currentReview)
      return next(
        new AppError(
          "You are not allowed to update or delete other user's review",
          401
        )
      );

    const reviewStats = await Movie.aggregate<IMovieReviewStats>([
      {
        $match: {
          _id: new Types.ObjectId(currentReview.movie)
        }
      },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'movie',
          as: 'review'
        }
      },
      {
        $unwind: '$review'
      },
      {
        $project: { review: 1 }
      },
      {
        $group: {
          _id: null,
          numReviews: { $sum: 1 },
          avgReviews: { $avg: '$review.rating' }
        }
      },
      {
        $project: {
          numReviews: 1,
          avgReviews: { $round: ['$avgReviews', 2] }
        }
      }
    ]);

    const ratingsAverage = reviewStats[0]?.avgReviews || 0;
    const ratingsQuantity = reviewStats[0]?.numReviews || 0;

    await Movie.findOneAndUpdate(
      { _id: currentReview.movie },
      {
        $set: { ratingsAverage, ratingsQuantity }
      }
    );

    next();
  } catch (err: any) {
    next(err);
  }
};
