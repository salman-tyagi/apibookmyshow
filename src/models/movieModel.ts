import mongoose from 'mongoose';

import { IMovieSchema } from '../types';

const movieSchema = new mongoose.Schema<IMovieSchema>({
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
    maxlength: [60, 'Max length required is 60']
  },
  poster: {
    type: String,
    trim: true,
    minlength: [6, 'Min length required is 6'],
    maxlength: [60, 'Max length required is 60']
  },
  languages: { type: [String], required: [true, 'language is required'] },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    trim: true,
    minlength: [6, 'Min length required is 6'],
    maxlength: [30, 'Max length required is 30']
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
    // min: 1,
    max: 10
  },
  ratingsAverage: {
    type: Number,
    default: 0
  },
  votes: {
    type: Number,
    default: 1
  },
  genres: { type: [String], required: [true, 'Genre is required'] },
  certification: {
    type: String,
    required: [true, 'Please certification rating'],
    trim: true,
    minlength: [1, 'Min length required is 1'],
    maxlength: [2, 'Max length required is 2']
  },
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
    type: {
      director: [String],
      actionDirector: [String],
      producer: [String],
      creativeProducer: [String],
      executiveProducer: [String],
      cinematographer: [String],
      editor: [String],
      writer: [String],
      musician: [String],
      singer: [String],
      lyricist: [String],
      screenplay: [String]
    },
    required: [true, 'Must have a crew'],
    _id: false
  },
  createdAt: { type: Date, default: Date.now() }
});

const Movie = mongoose.model<IMovieSchema>('Movie', movieSchema);

export default Movie;
