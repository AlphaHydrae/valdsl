var util = require('util');

function ValidationError(errors, message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message || 'A validation error occurred.';
};

util.inherits(ValidationError, Error);

module.exports = ValidationError;
