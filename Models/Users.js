let mongoose = require('mongoose');
let bcrypt = require('../Utilis/Bcrypt');

let user = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  password: {
    type: String,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    required: [true, "email is mandatory"],
    unique: true,
    validate: {
      validator: function (v) {
        return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v); 
      }
    }
  }
});

module.exports = mongoose.model('User', user);