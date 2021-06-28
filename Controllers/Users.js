let userModel = require('../Models/User');
let bookingModel = require('../Models/Booking');
let flightModel = require('../Models/Flight');
let jwt = require('../Utilis/Authentication');
let bcrypt = require('../Utilis/Bcrypt');

let errHandler = function (err, req, res, next) {
  let error = {
    statusCode: err.statusCode || 500,
    message: err.message,
  }
  if (err.errors && err.errors.email && err.errors.email.message) {
    error.message = err.errors.email.message;
  }
  res.status(error.statusCode).send(error);
}

let login = async function(req, res, next) {
  let { email, password, mobile } = req.body;
  console.log('req', req.body);
  let criteria = {};
  if (email) criteria.email = email;
  else if (mobile) criteria.mobile = mobile;
  try {
    let user = await userModel.findOne(criteria);
    if (!user) next({ message: 'User not found', statusCode: 404 });

    let isAuth = await bcrypt.comparePassword(password, user.password);
    if (!isAuth) next({ message: 'Password is in correct. Please try again', statusCode: 400 });

    let token = jwt.createToken(user._id, user.admin);
    res.cookie('token', token, { maxAge: 3 * 24 * 60 * 60 * 1000 });
    res.json(token);
  } catch(err) {
    next(err);
  }
};

let signup = async function(req, res, next) {
  let {
    first_name, last_name, password, mobile, email, admin = false,
  } = req.body;
  let docToSave = {
    first_name,
    last_name,
    password,
    admin,
  };
  if (mobile) docToSave.mobile = mobile;
  if (email) docToSave.email = email;
  try {
    let user = await userModel.create(docToSave);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

let getBookings = async function(req, res, next) {
  let { userData } = req.body;
  if (userData.admin)
    res.status(401).send({ message: 'You are not the user', statusCode: 401 });
  try {
    let bookings = await bookingModel.find({ user: userData._id }, {}, { lean: true });
    res.send(bookings);
  } catch (error) {
    next(error);
  }
};

let bookFlight = async function(req, res, next) {
  let { userData, flight_ids, from_date, to_date, seats } = req.body;
  try {
    if (typeof flight_ids !== 'array' || !flight_ids.length) next({ statusCode: 400, message: 'Bad request'});
    if (userData.admin)
      res.status(401).send({ message: 'You are not the user', statusCode: 401 });

    let flights = await flightModel.find({ _id: { $in: flight_ids } }, {}, { lean: true }) || [];
    if (flights.length < flight_ids.length) throw { statusCode: 404, message: 'Few flights are not found. Check the ids' };

    let newDocs = [];
    let bulkUpdFlights = [];
    for (let flight of flights) {
      let newDoc = {
        user: userData._id,
        flight: flight._id,
        seat_no: flight.total_avail_seats,
        price: flight.price,
        from: flight.origin,
        to: flight.destination,
        from_date,
        to_date,
        pnr: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      };
      bulkUpdFlights.push({
        updateOne: {
          filter: { _id: flight._id },
          update: { $inc: { total_avail_seats: -seats } },
        }
      })
      newDocs.push(newDoc);
    }
    let bookings = await bookingModel.insertMany(newDocs);
    let flightDocs = await flightModel.bulkWrite(bulkUpdFlights);
    console.log({ flightDocs });
    res.send(bookings);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  login,
  signup,
  getBookings,
  bookFlight,
  errHandler,
};