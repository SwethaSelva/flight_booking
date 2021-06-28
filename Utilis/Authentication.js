let jwt = require('jsonwebtoken');
let userModel = require('../Models/User');
let appConstants = require('../Utilis/AppConstants');

let createToken = (id, admin) => {
  return jwt.sign({ id, admin }, appConstants.jwtSecretKey, { expiresIn: 3 * 24 * 60 * 60 });
};

const verifyToken = async function (req, res, next) {
  try {
    let token = req.headers.authorization;
    if (!token) throw new Error('User Unauthorized');

    let decoded = jwt.verify(token, appConstants.jwtSecretKey);
    if (!decoded && !decoded.id) throw new Error('User Unauthorized');

    let user = await userModel.findOne({ _id: decoded.id }, {}, { lean: true });
    if (!user) throw new Error('User Unauthorized');

    req.body.userData = user;
    next();
  } catch (error) {
    res.status(401).send({
      message: 'User Unauthorized', statusCode: 401,
    });
  }
};

module.exports = {
  createToken,
  verifyToken,
};