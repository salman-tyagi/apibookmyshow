import mongoose from 'mongoose';

import { ITheatreSchema } from '../types';

const theatreSchema = new mongoose.Schema<ITheatreSchema>({
  theatre: {
    type: String,
    required: [true, 'Please provide theatre name'],
    unique: true,
    trim: true,
    minlength: [6, 'Name must be minimum 10 characters long'],
    maxlength: [40, 'Name must be less than 40 characters']
  },
  multiplexChain: {
    type: String,
    enum: ['inox', 'pvr', 'cinepolis'],
    required: [true, 'Please provide multiplex chain']
  },
  location: {
    lat: Number,
    lng: Number
  },
  address: {
    type: String,
    trim: true,
    maxlength: [100, 'Max characters should be 100 or less']
  },
  locality: {
    type: String,
    required: [true, 'Please provide locality'],
    trim: true,
    minlength: [4, 'Length must be at least 4'],
    maxlength: [20, 'Length must be at most 40']
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
  },
  seats: {
    vip: [String],
    executive: [String],
    normal: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

const Theatre = mongoose.model<ITheatreSchema>('Theatre', theatreSchema);

export default Theatre;
