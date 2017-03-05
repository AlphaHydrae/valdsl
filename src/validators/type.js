const _ = require('lodash');
const MessageFormat = require('messageformat');

const mf = new MessageFormat('en');
const defaultMessage = mf.compile('must be of type {TYPE}');
const availableTypes = [ 'string', 'number', 'object', 'array', 'boolean' ];

export default function type() {

  var types = _.uniq(_.toArray(arguments));
  _.each(types, function(type) {
    if (!_.includes(availableTypes, type)) {
      throw new Error('Unknown validator type ' + JSON.stringify(type));
    }
  });

  var typeDescription = _.reduce(types, function(memo, type, i) {
    if (i > 0 && i == types.length - 1) {
      return memo + ' or ' + type;
    } else if (i !== 0) {
      return memo + ', ' + type;
    } else {
      return type;
    }
  }, '');

  return function(context) {

    var value = context.get('value');
    if (value === undefined || value === null) {
      return;
    }

    var valid = _.includes(types, typeof(value));
    if (types.length == 1 && types[0] == 'array') {
      valid = _.isArray(value);
    }

    if (!valid) {
      context.addError({
        validator: 'type',
        message: defaultMessage,
        messageParameters: {
          TYPE: typeDescription
        }
      });
    }
  };
}
