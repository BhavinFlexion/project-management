const validator = require('validator');

const validateInteger = (value, attributeName) => {
    if (!validator.isInt(String(value))) {
        throw new Error(`Invalid ${attributeName} format`);
    }
};

module.exports = {
    validateInteger,
};
