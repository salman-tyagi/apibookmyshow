import mongoose from 'mongoose';

import { IBookingSchema } from '../types';

const bookingSchema = new mongoose.Schema<IBookingSchema>({
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
  seats: {
    type: String || [String],
    required: [true, 'Please provide seat/seats'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide price']
  },
  showDate: {
    type: Date,
    required: [true, 'Please provide show date']
  },
  showTime: {
    type: Date,
    required: [true, 'Please provide show time']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

const Booking = mongoose.model<IBookingSchema>('Booking', bookingSchema);

export default Booking;
