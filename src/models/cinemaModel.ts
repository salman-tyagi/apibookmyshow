import mongoose from 'mongoose';

import { ICinemaSchema } from '../types';

const cinemaSchema = new mongoose.Schema<ICinemaSchema>({
  name: {
    type: String,
    required: [true, 'Please provide cinema screen'],
    unique: true,
    trim: true,
    minlength: [6, 'Name must be minimum 10 characters long'],
    maxlength: [40, 'Name must be less than 40 characters']
  },
  // screen: {
  //   type: [String],
  //   required: [true, 'Please provide screen type']
  // },
  multiplexChain: {
    type: String,
    enum: ['inox', 'pvr', 'cinepolis'],
    required: [true, 'Please provide franchise name']
  },
  movies: {
    type: [String]
  },
  location: {
    lat: Number,
    lng: Number
  },
  address: {
    type: String,
    trim: true,
    maxlength: [50, 'Max characters should be 50 or less']
  },
  city: {
    type: String,
    required: [true, 'Please provide city'],
    trim: true,
    minlength: [4, 'Min characters required 4'],
    maxlength: [20, 'Max characters required 20']
  },
  state: {
    type: String,
    required: [true, 'Please provide city'],
    trim: true,
    minlength: [4, 'Min characters required 4'],
    maxlength: [20, 'Max characters required 20']
  },
  pincode: {
    type: Number,
    required: [true, 'Please provide pincode'],
    maxlength: [6, 'Max length should be 6']
  },
  region: {
    type: String,
    required: [true, 'Please provide region'],
    trim: true,
    minlength: [4, 'Min characters required 4'],
    maxlength: [20, 'Min characters required 20']
  },
  country: {
    type: String,
    required: [true, 'Please provide country'],
    trim: true,
    minlength: [4, 'Min characters required 4'],
    maxlength: [20, 'Max characters required 20']
  },
  facilities: {
    type: {
      ticketCancellation: Boolean,
      foodAndBeverages: Boolean,
      mTicket: Boolean,
      wheelChair: Boolean,
      parking: Boolean,
      foodCourt: Boolean
    },
    required: [true, 'Please provide facilities'],
    _id: false
  }
});

const Cinema = mongoose.model<ICinemaSchema>('Cinema', cinemaSchema);

export default Cinema;
