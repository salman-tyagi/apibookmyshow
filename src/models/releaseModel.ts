import mongoose from 'mongoose';

import { IReleaseSchema } from '../types';

const releaseSchema = new mongoose.Schema<IReleaseSchema>({
  movie: {
    type: mongoose.Schema.ObjectId,
    ref: 'Movie',
    required: [true, 'Please provide movie id'],
    trim: true
  },
  theatre: {
    type: mongoose.Schema.ObjectId,
    ref: 'Theatre',
    required: [true, 'Please provide theatre id'],
    trim: true
  },
  releaseDate: {
    type: Date,
    required: [true, 'Please provide release date']
  },
  screen: {
    type: [String],
    enum: ['2d', '3d', 'imax', 'imax4d'],
    required: [true, 'Please provide screen']
  },
  movieDateAndTime: {
    type: [Date],
    required: [true, 'Please provide show time']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

releaseSchema.index({ movie: 1, theatre: 1 }, { unique: true });

const Release = mongoose.model<IReleaseSchema>('Release', releaseSchema);

export default Release;
