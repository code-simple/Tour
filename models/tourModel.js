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
  price: {
    type: Number,
    required: [true, 'Price is Missing.'],
  },
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
