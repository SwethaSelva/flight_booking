let route = require('express').Router();
let userController = require('../Controllers/User');
let auth = require('../Utilis/Authentication');

route.get('/login', userController.login);
route.post('/signup', userController.signup);
route.get('/get_bookings', auth.verifyToken, userController.getBookings);
route.post('/book_flight', auth.verifyToken, userController.bookFlight);

route.use(userController.errHandler);

module.exports = route;