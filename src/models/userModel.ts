import mongoose from 'mongoose';

import { IUserSchema } from '../types';

const userSchema = new mongoose.Schema<IUserSchema>({
  firstName: {
    type: String,
    minlength: [2, 'Min required length 6'],
    maxlength: [30, 'Max required length 30'],
    trim: true
  },
  lastName: {
    type: String,
    minlength: [2, 'Min required length 6'],
    maxlength: [30, 'Max required length 30'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    minlength: [6, 'Min required length 6'],
    maxlength: [30, 'Max required length 30'],
    trim: true
  },
  photo: { type: String },
  OTP: {
    type: Number,
    minlength: [10, 'Min required length 10'],
    maxlength: [10, 'Max required length 10']
  },
  mobile: {
    type: Number,
    minlength: 10,
    maxlength: 10
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  active: {
    type: Boolean,
    default: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  personalDetails: {
    birthday: Date,
    identity: { type: String, enum: ['man', 'woman'] },
    married: Boolean
  },
  address: {
    city: {
      type: String,
      minlength: [6, 'Min required length 6'],
      maxlength: [30, 'Max required length 30'],
      trim: true
    },
    state: {
      type: String,
      minlength: [6, 'Min required length 6'],
      maxlength: [30, 'Max required length 30'],
      trim: true
    },
    pincode: { type: Number, minlength: 6, maxlength: 6 },
    landmark: {
      type: String,
      minlength: [6, 'Min required length 6'],
      maxlength: [30, 'Max required length 30'],
      trim: true
    },
    address: {
      type: String,
      minlength: [6, 'Min required length 6'],
      maxlength: [30, 'Max required length 30'],
      trim: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

const User = mongoose.model<IUserSchema>('User', userSchema);

export default User;
