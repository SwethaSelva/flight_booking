let mongoose = require('mongoose');

let flight = new mongoose.Schema({
  name: {
    unique: true,
    required: true,
    type: String,
  },
  origin: {
    type: String,
    required: [true, 'origin is required']
  },
  destination: {
    type: String,
    required: [true, 'destination is required']
  },
  carrier_name: String,
  price: {
    type: Number,
    required: [true, 'price is required']
  },
  book_date: {
    type: Date,
    default: new Date()
  },
  total_seats: {
    type: Number,
    default: 0
  },
  total_avail_seats: {
    type: Number,
    default: 0
  },
});

module.exports = mongoose.model('Flight', flight);