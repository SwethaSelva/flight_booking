let jwt = require('../Utilis/Authenticate');
let bcrypt = require('../Utilis/Bcrypt');

let userModel = require('../Models/User');

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

module.exports = {
  login,
  signup,
  errHandler,
};