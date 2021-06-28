let route = require('express').Router();
let auth = require('../Utilis/Authentication');
let flightController = require('../Controllers/Flight');

route.get('/search', flightController.search);

route.get('/get', flightController.get);

route.get('/get/:id', flightController.getOne);

route.delete('/delete/:id', auth.verifyToken, flightController.deleteOne); 

route.post('/create', auth.verifyToken, flightController.create);

route.put('/update/:id', auth.verifyToken, flightController.update);

route.use(flightController.errHandler);

module.exports = route;