let express = require('express');
let mongoose = require('mongoose');
let cookieParser = require('cookie-parser');

let app = express();
let { dbURI, port } = require('./Utilis/AppConstants.js');
let userRoute = require('./Routes/User');

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/user', userRoute);

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((data) => console.log('Successfully connected to DB'))
  .catch((err) => console.log(err));

app.listen(port, () => console.log('Successfully connect to express'));