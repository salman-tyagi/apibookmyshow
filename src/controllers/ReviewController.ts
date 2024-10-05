import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

import Review from '../models/reviewModel';
import AppError from '../utils/AppError';
import { bodyValidator, controller, del, get, patch, post, use } from './decorators';
import protect from '../middlewares/protect';
import accessAllowedTo from '../middlewares/accessAllowedTo';
import ApiFeatures from '../utils/ApiFeatures';

import { IReqParamsWithId, IResBody, IReviewRequest, ResStatus, IReviewReqBody } from '../types';

@controller('/reviews')
class ReviewController {
  @get('/')
  async getAllReviews(
    req: Request,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const apiFeatures = new ApiFeatures(Review.find(), req.query)
        .filter()
        .sort()
        .projection()
        .pagination();

      const reviews = await apiFeatures.query.populate({
        path: 'movie user',
        select: 'title name email'
      });

      return res.status(200).json({
        status: ResStatus.Success,
        result: reviews.length,
        data: reviews
      });
    } catch (err) {
      next(err);
    }
  }

  @post('/:id')
  @bodyValidator('review', 'rating')
  @use(protect)
  @use(accessAllowedTo('user'))
  async createReview(
    req: IReviewRequest,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide movie id', 400));

      const { review: movieReview, rating } = req.body;
      
      const review = await Review.create<IReviewReqBody>({
        review: movieReview,
        rating,
        movie: new Types.ObjectId(id),
        user: req.user._id
      });

      return res.status(201).json({ status: ResStatus.Success, data: review });
    } catch (err) {
      next(err);
    }
  }

  @get('/:id')
  @use(protect)
  @use(accessAllowedTo('user'))
  async getReview(
    req: Request<IReqParamsWithId>,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide id', 400));

      const review = await Review.findOne({ _id: id });
      if (!review) return next(new AppError('No review found', 404));

      return res.status(200).json({ status: ResStatus.Success, data: review });
    } catch (err) {
      next(err);
    }
  }

  @patch('/:id')
  @use(protect)
  @use(accessAllowedTo('user'))
  async updateReview(
    req: IReviewRequest,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { params: { id }, body: { review: movieReview, rating } } = req;
      if (!id) return next(new AppError('Please provide id', 400));

      if (!movieReview && !rating)
        return next(new AppError('Please provide review or rating', 400));

      const payload = { review: movieReview, rating };

      const review = await Review.findOneAndUpdate(
        { _id: id, user: req.user._id },
        { $set: payload },
        { runValidators: true, new: true }
      );

      if (!review) return next(new AppError('No review found', 404));

      return res.status(201).json({ status: ResStatus.Success, data: review });
    } catch (err) {
      next(err);
    }
  }

  @del('/:id')
  @use(protect)
  @use(accessAllowedTo('user'))
  async deleteReview(
    req: IReviewRequest,
    res: Response<IResBody>,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) return next(new AppError('Please provide review id', 400));

      const review = await Review.findOneAndDelete({
        _id: id,
        user: req.user._id
      });

      if (!review) return next(new AppError('No review found', 404));

      return res.status(204).json({ status: ResStatus.Success });
    } catch (err) {
      next(err);
    }
  }
}

export default ReviewController;
