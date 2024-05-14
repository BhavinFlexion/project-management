const validator = require("validator");

exports.validateInteger = (value, attributeName) => {
  if (!validator.isInt(String(value))) {
    throw new Error(`Invalid ${attributeName} format`);
  }
};
