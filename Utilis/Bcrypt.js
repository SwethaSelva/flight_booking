let bcrypt = require('bcrypt');

let genPasswordHash = async (password) => {
  let salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
};

let comparePassword = async (password, encryptPassword) => {
  console.log({ password, encryptPassword });
  let isAuth = await bcrypt.compare(password, encryptPassword);
  return isAuth;
};

module.exports = {
  genPasswordHash,
  comparePassword,
};