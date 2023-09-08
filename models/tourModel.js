const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is Missing,'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'Maximum Group Size is required.'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have Difficulty , e.g Easy, Medium, Hard'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  priceDiscount: {
    type: Number,
  },
  summary: {
    type: String,
    trim: true, // It will removes all white spaces from start and end will be removed.
    required: [true, 'A Tour must have description'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: true,
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDates: [Date],
  ratingsQuatity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'Price is Missing.'],
  },
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
