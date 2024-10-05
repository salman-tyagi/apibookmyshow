import mongoose from 'mongoose';

import { IBookingSchema } from '../types';

const bookingSchema = new mongoose.Schema<IBookingSchema>(
  {
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
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user id']
    },
    seatType: {
      type: String,
      enum: ['vip', 'executive', 'normal'],
      required: [true, 'Please provide seat type'],
      trim: true
    },
    seats: {
      type: [{ row: Number, column: Number }],
      required: [true, 'Please provide seat/seats'],
      trim: true,
      _id: false
    },
    movieDateAndTime: {
      type: Date,
      required: [true, 'Please provide movie date and time']
    },
    ticketPrice: {
      type: Number,
      required: [true, 'Please provide price']
    },
    createdAt: {
      type: Date,
      default: Date.now()
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
    versionKey: false
  }
);

bookingSchema.virtual('totalPrice').get(function (): number {
  return this.seats.length * this.ticketPrice;
});

const Booking = mongoose.model<IBookingSchema>('Booking', bookingSchema);

export default Booking;
