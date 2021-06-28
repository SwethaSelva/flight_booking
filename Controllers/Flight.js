let flightModel = require('../Models/Flight');
let { objIdValidator } = require('../Utilis/Helper');

let errHandler = function (err, req, res, next) {
  let error = {
    statusCode: err.code || 500,
    message: err.msg || "Something went wrong. Please try again later",
  }
  if (err.errors) {
    for (let key in err.errors) {
      error.statusCode = 400;
      if (err.errors[key].name === "ValidatorError") {
        error.message = "Please enter the required fields";
        break;
      }
    }
  }
  if (err.code === 11000) {
    error.statusCode = 600;
    error.message = `The one of the field is already exists`;
  }
  res.status(error.statusCode).send(error);
};

let search = async (req, res, next) => {
  try {
    let { origin: from, destination: to, date, seats = 1 } = req.body;
    let bookDate = new Date(date);
    if (bookDate === 'Invalid date') next({ code: 400, msg: 'Wrong date' });
    let criteria = {
      book_date: bookDate,
      total_avail_seats: { $gte: seats },
      $or: [{ origin: from }, { destination: to }],
    };
    let possibleFlights = await flightModel.find(criteria, {}, { lean: true }) || [];
    if (!possibleFlights.length) res.send(possibleFlights)

    // Graph implementation.
    // Create a adjacent list to manipulate.
    let flightDetails = [];
    let stationPair = {}; // Save id for specific combination in hash.
    let adjFlights = {};
    for (let flight of possibleFlights) {
      let { origin, destination } = flight;
      if (flight.origin === from && flight.destination === to)
        flightDetails.push({ flight: [flight], stops: 0, price: flight.price });
      else {
        if (!flight.origin || !flight.destination) continue; // Caution condition.
        if (!adjFlights[flight.origin]) adjFlights[flight.origin] = [];
        if (!adjFlights[flight.destination]) adjFlights[flight.destination] = [];
        stationPair[`${origin}-${destination}`] = flight;
        adjFlights[flight.origin].push(flight);
      }
    }

    // DFS to find all possible path.
    function clone( A ) { return JSON.parse( JSON.stringify( A ) ) };
    let validPaths = [];
    function traverse( flight=from, path=[]) {
      path.push(flight);
      if (flight === to) {
        validPaths.push(clone( path ));
        return;
      }
      for (let neigh of adjFlights[flight]) {
        if ( path.indexOf( neigh.destination ) === -1 ) {
          traverse( neigh.destination, clone(path) );
        }
      }
    }
    traverse();

    // create flight combination using valid path
    for (let i = 0; i < validPaths.length; i++) {
      if (validPaths[i].length > 4) continue; // Omit path length more than 3 flights.  
      let price = 0;
      let stops = -1;
      let tempFlights = [];
  
      for (let j = 1; j < validPaths[i].length; j++) {
        let origin = validPaths[i][j-1];
        let destination = validPaths[i][j];
        let flight = stationPair[`${origin}-${destination}`];
        tempFlights.push(flight);
        price += flight.price;
        stops++;
      }
      flightDetails.push({ flights: tempFlights, price, stops })
    }
    res.json(flightDetails);
  } catch (error) {
    next(error)
  }
};

let create = async (req, res, next) => {
  let { userData, name, origin, destination, carrier_name, price, book_date=new Date(), total_seats } = req.body;
  try {
    if (!userData || !userData._id || !userData.admin) throw { code: 401, msg: 'User Unauthorized' };
    let newFlight = await flightModel.create({
      name, origin, destination, carrier_name, price, total_seats, total_avail_seats: total_seats, book_date,
    });
    res.send(newFlight);
  } catch (error) {
    next(error);
  }
};
let update = async (req, res, next) => {
  let _id = req.params.id;
  let { userData, carrier_name, price, book_date, total_avail_seats } = req.body;
  try {
    if (!_id || !objIdValidator(_id)) throw { code: 400, msg: 'paramater is not correct'};
    if (!userData || !userData._id || !userData.admin) throw { statusCode: 401, message: 'User Unauthorized' };
    let dataToUpdate = {};
    if (carrier_name) dataToUpdate.carrier_name = carrier_name;
    if (price) dataToUpdate.price = price;
    if (book_date) dataToUpdate.book_date = book_date;
    if (total_avail_seats) dataToUpdate.total_avail_seats = total_avail_seats;
    let newData = await flightModel.findOneAndUpdate({ _id }, dataToUpdate, { new: true });
    res.json(newData);
  } catch (error) {
    next(error); 
  }
};
let get = async (req, res, next) => {
  try {
    let flights = await flightModel.find() || [];
    res.json(flights);
  } catch (error) {
    next(error);
  }
};
let getOne = async (req, res, next) => {
  let _id = req.params.id;
  try {
    if (!_id || !objIdValidator(_id)) throw { code: 400, msg: 'paramater is not correct'};
    let flight = await flightModel.findById(_id, {}, { lean: true });
    res.json(flight);
  } catch (error) {
    next(error);
  }
};
let deleteOne = async (req, res, next) => {
  let _id = req.params.id;
  try {
    if (!_id || !objIdValidator(_id)) throw { code: 400, msg: 'paramater is not correct'};
    await flightModel.deleteOne({ _id });
    res.send({ message: 'Deleted Successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  update,
  search,
  get,
  getOne,
  deleteOne,
  errHandler,
};