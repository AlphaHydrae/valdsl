import _ from 'lodash';
import { dynamicMessage } from '../utils';

const defaultMessage = dynamicMessage('must be of type {typeDescription}');
const availableTypes = [ 'string', 'number', 'object', 'array', 'boolean' ];

export default function type(...types) {

  types = _.uniq(types);
  _.each(types, function(type) {
    if (!_.includes(availableTypes, type)) {
      throw new Error('Unknown type ' + JSON.stringify(type));
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

    const valid = _.some(types, type => isOfType(value, type));
    if (!valid) {
      context.addError({
        validator: 'type',
        types: types,
        message: defaultMessage({ typeDescription: typeDescription })
      });
    }
  };
}

function isOfType(value, type) {
  if (type == 'array') {
    return _.isArray(value);
  } else if (type == 'object') {
    return _.isPlainObject(value);
  } else {
    return typeof(value) == type;
  }
}
