import mongoose from 'mongoose';

import { IMovieSchema } from '../types';

const movieSchema = new mongoose.Schema<IMovieSchema>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      unique: true,
      trim: true,
      minlength: [6, 'Min length required is 6'],
      maxlength: [30, 'Max length required is 30']
    },
    image: {
      type: String,
      trim: true,
      minlength: [6, 'Min length required is 6'],
      maxlength: [30, 'Max length required is 30']
    },
    poster: {
      type: String,
      trim: true,
      minlength: [6, 'Min length required is 6'],
      maxlength: [30, 'Max length required is 30']
    },
    languages: { type: [String], required: [true, 'language is required'] },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      trim: true,
      minlength: [6, 'Min length required is 6'],
      maxlength: [30, 'Max length required is 30']
    },
    likesQuantity: {
      type: Number,
      default: 1
    },
    likesAverage: {
      type: Number,
      default: 0
    },
    comments: {
      type: String,
      trim: true,
      minlength: [6, 'Min length required is 6'],
      maxlength: [30, 'Max length required is 30']
    },
    genres: { type: [String], required: [true, 'Genre is required'] },
    releaseDate: { type: Date, required: [true, 'Release date is required'] },
    about: {
      type: String,
      required: [true, 'About is required'],
      trim: true,
      minlength: [6, 'Min length required is 6'],
      maxlength: [600, 'Max length required is 600']
    },
    cast: {
      type: { actor: [String], actress: [String] },
      required: [true, 'Must have a actor or actress'],
      _id: false
    },
    crew: {
      type: Object,
      required: [true, 'Must have a crew'],
      _id: false
    },
    createdAt: { type: Date, default: Date.now() }
  },
  { versionKey: false }
);

const Movie = mongoose.model<IMovieSchema>('Movie', movieSchema);

export default Movie;
