import mongoose from 'mongoose';

import { IReviewSchema } from '../types';

const reviewSchema = new mongoose.Schema<IReviewSchema>({
  review: {
    type: String,
    required: [true, 'Please provide review'],
    minlength: [2, 'Review must be at least 2 characters long'],
    maxlength: [20, 'Review must be less than or equal to 20 characters long'],
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide rating for movie'],
    min: [1, 'Min. rating should be 1 or more'],
    max: [10, 'Max. rating should be 10 or less']
  },
  movie: {
    type: mongoose.Schema.ObjectId,
    ref: 'Movie',
    required: [true, 'Please provide movie id']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

const Review = mongoose.model<IReviewSchema>('Review', reviewSchema);

export default Review;
