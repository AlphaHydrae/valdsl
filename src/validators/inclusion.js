const _ = require('lodash');
const MessageFormat = require('messageformat');

const mf = new MessageFormat('en');
const defaultMessage = mf.compile('must be one of {ALLOWED_VALUES}');

export default function inclusion(options) {

  var allowedValues;
  if (_.isObject(options)) {
    allowedValues = options.in;
  } else {
    allowedValues = _.toArray(arguments);
  }

  return function(context) {
    if (!_.includes(allowedValues, context.get('value'))) {
      context.addError({
        validator: 'inclusion',
        message: defaultMessage,
        messageParameters: {
          ALLOWED_VALUES: allowedValues.join(', ')
        }
      });
    }
  };
}
