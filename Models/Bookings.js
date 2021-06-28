let mongoose = require('mongoose');

let bookings = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  flight: {
    type: mongoose.Types.ObjectId,
    ref: 'Flight',
    required: true,
  },
  seat_no: {
    type: Number,
    required: true,
  },
  pnr: {
    type: String,
    required: true,
  },
  price: Number,
  from: String,
  to: String,
  from_date: Date,
  to_date: Date,
});

module.exports = mongoose.model('Booking', bookings);