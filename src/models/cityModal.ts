import mongoose from 'mongoose';

import { ICitySchema } from '../types';

const citySchema = new mongoose.Schema<ICitySchema>({
  city: {
    type: String,
    unique: true,
    minlength: [4, 'Length must be at least 4'],
    maxlength: [30, 'Max length should be 30 or less'],
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

const City = mongoose.model<ICitySchema>('City', citySchema);

export default City;
