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
    seatType: {
      type: String,
      enum: ['vip', 'executive', 'normal'],
      required: [true, 'Please provide seat type'],
      trim: true
    },
    seats: {
      type: [String],
      required: [true, 'Please provide seat/seats'],
      trim: true
    },
    ticketPrice: {
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
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

bookingSchema.virtual('totalPrice').get(function (): number {
  return this.seats.length * this.ticketPrice;
});

const Booking = mongoose.model<IBookingSchema>('Booking', bookingSchema);

export default Booking;
