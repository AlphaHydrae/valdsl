import _ from 'lodash';
import Actions from './validation-actions';
import Conditionals from './plugins/conditionals';
import Utils from './validation-utils';
import ValidationContext from './validation-context';
import ValidationError from './validation-error';
import Validators from './validators';

export default function() {

  class CustomValidationContext extends ValidationContext {
  }

  var dsl = function validate(options, callback) {
    if (_.isFunction(options)) {
      callback = options;
      options = undefined;
    }

    return new CustomValidationContext(options).ensureValid(callback);
  };

  dsl.ValidationContext = CustomValidationContext;
  dsl.ValidationError = ValidationError;

  dsl.plugin = function(callback) {
    callback(dsl);
    return dsl;
  };

  CustomValidationContext.extendDsl(Actions);
  CustomValidationContext.extendDsl(Utils);
  CustomValidationContext.extendDsl(Validators);

  dsl.plugin(Conditionals);

  return dsl;
}
