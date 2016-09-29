var _ = require('lodash'),
    ValidationContext = require('./lib/validation-context'),
    ValidationError = require('./lib/validation-error');

ValidationContext.extend(require('./lib/validation-actions'));
ValidationContext.extend(require('./lib/validation-utils'));
ValidationContext.extend(require('./lib/validators'));
ValidationContext.use(require('./lib/plugins/conditionals'));

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
