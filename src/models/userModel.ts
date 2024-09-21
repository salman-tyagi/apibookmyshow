import mongoose from 'mongoose';

import { IUserSchema } from '../types';

const userSchema = new mongoose.Schema<IUserSchema>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      minlength: [6, 'Min required length 6'],
      maxlength: [30, 'Max required length 30'],
      trim: true
    },
    OTP: {
      type: Number,
      maxlength: 6,
      minlength: 6
    },
    createdAt: {
      type: Date,
      default: Date.now()
    }
  },
  {
    versionKey: false
  }
);

const User = mongoose.model('User', userSchema);

export default User;
