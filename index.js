var _ = require('lodash'),
    ValidationContext = require('./lib/validation-context'),
    ValidationError = require('./lib/validation-error');

module.exports = validate;

_.extend(module.exports, {
  ValidationContext: ValidationContext,
  ValidationError: ValidationError
});

function validate(options, callback) {
  if (_.isFunction(options)) {
    callback = options;
    options = undefined;
  }

  return new ValidationContext(options).ensureValid(callback);
}
