import _ from 'lodash';
import { dynamicMessage } from '../utils';

const defaultMessage = dynamicMessage('must be a string ' +
  '{validation, select,' +
  ' exactly{exactly {minLength} {minLength, plural, one{character} other{characters}} long}' +
  ' atLeast{at least {minLength} {minLength, plural, one{character} other{characters}} long}' +
  ' atMost{at most {maxLength} {maxLength, plural, one{character} other{characters}} long}' +
  ' other{between {minLength} and {maxLength} {maxLength, plural, one{character} other{characters}} long}}' +
  ' ' +
  '({cause, select,' +
  ' tooShort{the supplied string is too short: {actualLength} {actualLength, plural, one{character} other{characters}} long}' +
  ' tooLong{the supplied string is too long: {actualLength} {actualLength, plural, one{character} other{characters}} long}' +
  ' other{the supplied value is of the wrong type}})');

export default function stringLength(min, max, options) {
  if (_.isObject(min)) {
    options = min;
  } else {
    options = _.defaults({}, options, {
      min: min,
      max: max
    });
  }

  if (options.min !== undefined && !_.isNumber(options.min)) {
    throw new Error('String length validator `min` option must be a number, got ' + typeof(options.min));
  } else if (options.max !== undefined && !_.isNumber(options.max)) {
    throw new Error('String length validator `max` option must be a number, got ' + typeof(options.max));
  }

  let validation;
  if (options.min !== undefined && options.min === options.max) {
    validation = 'exactly';
  } else if (options.min !== undefined && options.max !== undefined) {
    validation = 'between';
  } else if (options.min !== undefined) {
    validation = 'atLeast';
  } else {
    validation = 'atMost';
  }

  return function(context) {

    const value = context.get('value');

    let cause;
    if (!_.isString(value)) {
      cause = 'wrongType';
    } else if (options.min !== undefined && value.length < options.min) {
      cause = 'tooShort';
    } else if (options.max !== undefined && value.length > options.max) {
      cause = 'tooLong';
    }

    if (cause) {
      context.addError({
        validator: 'stringLength',
        validation: validation,
        minLength: options.min,
        maxLength: options.max,
        actualLength: _.isString(value) ? value.length : undefined,
        cause: cause,
        message: defaultMessage
      });
    }
  };
}
