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
    type: String,
    enum: ['2d', '3d', 'imax', 'imax4d', 'ice3d', 'ice', '4dx', '4dx3d'],
    required: [true, 'Please provide screen']
  },
  language: {
    type: String,
    enum: ['english', 'hindi', 'tamil', 'telugu', 'malayalam'],
    required: [true, 'Please provide language']
  },
  price: {
    vip: {
      type: Number,
      required: [true, 'Please provide vip price']
    },
    executive: {
      type: Number,
      required: [true, 'Please provide executive price']
    },
    normal: {
      type: Number,
      required: [true, 'Please provide normal price']
    }
  },
  movieDateAndTime: {
    type: [Date],
    required: [true, 'Please provide show time']
  },
  slug: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

releaseSchema.index(
  { theatre: 1, movie: 1, screen: 1, language: 1 },
  { unique: true }
);
releaseSchema.index({ theatre: 1, movieDateAndTime: 1 }, { unique: true });

const Release = mongoose.model<IReleaseSchema>('Release', releaseSchema);

export default Release;
