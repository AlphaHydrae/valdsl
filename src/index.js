import _ from 'lodash';
import Actions from './validation-actions';
import Conditionals from './plugins/conditionals';
import Utils from './validation-utils';
import ValidationContext from './validation-context';
import ValidationError from './validation-error';
import Validators from './validators';

ValidationContext.extend(Actions);
ValidationContext.extend(Utils);
ValidationContext.extend(Validators);
ValidationContext.use(Conditionals);

function validate(options, callback) {
  if (_.isFunction(options)) {
    callback = options;
    options = undefined;
  }

  return new ValidationContext(options).ensureValid(callback);
}

validate.ValidationContext = ValidationContext;
validate.ValidationError = ValidationError;

export default validate;
