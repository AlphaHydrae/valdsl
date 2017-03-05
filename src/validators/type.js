import _ from 'lodash';
import { dynamicMessage } from '../utils';

const defaultMessage = dynamicMessage('must be of type {typeDescription}');
const availableTypes = [ 'string', 'number', 'object', 'array', 'boolean' ];

export default function type() {

  const types = _.uniq(_.toArray(arguments));
  _.each(types, function(type) {
    if (!_.includes(availableTypes, type)) {
      throw new Error('Unknown validator type ' + JSON.stringify(type));
    }
  });

  const typeDescription = _.reduce(types, function(memo, type, i) {
    if (i > 0 && i == types.length - 1) {
      return memo + ' or ' + type;
    } else if (i !== 0) {
      return memo + ', ' + type;
    } else {
      return type;
    }
  }, '');

  return function(context) {

    const value = context.get('value');
    if (value === undefined || value === null) {
      return;
    }

    let valid = _.includes(types, typeof(value));
    if (types.length == 1 && types[0] == 'array') {
      valid = _.isArray(value);
    }

    if (!valid) {
      context.addError({
        validator: 'type',
        typeDescription: typeDescription,
        message: defaultMessage
      });
    }
  };
}
