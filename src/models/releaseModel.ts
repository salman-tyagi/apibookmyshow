import mongoose from 'mongoose';

import { IReleaseSchema } from '../types';

const releaseSchema = new mongoose.Schema<IReleaseSchema>({
  movie: {
    type: mongoose.Schema.ObjectId,
    ref: 'Movie',
    required: [true, 'Movie is required'],
    trim: true
  },
  theatres: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Theatre',
      required: [true, 'Theatre ids required'],
      trim: true
    }
  ],
  releaseDate: {
    type: Date
  },
  timings: {
    type: [Date]
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

const Release = mongoose.model<IReleaseSchema>('Release', releaseSchema);

export default Release;
