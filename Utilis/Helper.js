let objIdValidator = (str) => /^[0-9a-fA-F]{24}$/.test(str);

module.exports = { objIdValidator };