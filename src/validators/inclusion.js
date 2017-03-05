import _ from 'lodash';
import { dynamicMessage } from '../utils';

const defaultMessage = dynamicMessage('must be one of {allowedValuesDescription}');

export default function inclusion(options) {

  let allowedValues;
  if (_.isObject(options)) {
    allowedValues = options.in;
  } else {
    allowedValues = _.toArray(arguments);
  }

  return function(context) {
    if (!_.includes(allowedValues, context.get('value'))) {
      context.addError({
        validator: 'inclusion',
        allowedValues: allowedValues,
        allowedValuesDescription: allowedValues.join(', '),
        message: defaultMessage
      });
    }
  };
}
