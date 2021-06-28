let express = require('express');
let mongoose = require('mongoose');
let cookieParser = require('cookie-parser');

let app = express();
let { dbURI, port } = require('./Utilis/AppConstants.js');

// Middlewares
app.use(express.json());
app.use(cookieParser());

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((data) => console.log('Successfully connected to DB'))
  .catch((err) => console.log(err));

app.listen(port, () => console.log('Successfully connect to express'));