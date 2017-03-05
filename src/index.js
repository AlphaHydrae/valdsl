import _ from 'lodash';
import Actions from './validation-actions';
import Conditionals from './plugins/conditionals';
import DefaultValidators from './plugins/default-validators';
import Utils from './utils';
import ValidationContext from './context';
import ValidationError from './error';
import ValidationErrorBundle from './error-bundle';

export default function() {

  class CustomValidationContext extends ValidationContext {
  }

  var dsl = {};

  var valdsl = function validate(options, callback) {
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    options.dsl = dsl;

    return new CustomValidationContext(options).ensureValid(callback);
  };

  valdsl.dsl = dsl;
  valdsl.ValidationContext = CustomValidationContext;
  valdsl.ValidationError = ValidationError;
  valdsl.ValidationErrorBundle = ValidationErrorBundle;

  valdsl.plugin = function(callback) {
    callback(valdsl);
    return valdsl;
  };

  _.extend(dsl, Actions);
  _.extend(dsl, Utils);
  _.extend(dsl, DefaultValidators);

  valdsl.plugin(Conditionals);

  return valdsl;
}
