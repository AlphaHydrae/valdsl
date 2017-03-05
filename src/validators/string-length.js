const _ = require('lodash');
const MessageFormat = require('messageformat');

const mf = new MessageFormat('en');
const defaultMessage = mf.compile('must be a string ' +
  '{VALIDATION_TYPE, select,' +
  ' exactly{exactly {MIN} {MIN, plural, one{character} other{characters}} long}' +
  ' atLeast{at least {MIN} {MIN, plural, one{character} other{characters}} long}' +
  ' atMost{at most {MAX} {MAX, plural, one{character} other{characters}} long}' +
  ' other{between {MIN} and {MAX} {MAX, plural, one{character} other{characters}} long}}' +
  ' ' +
  '({CAUSE, select,' +
  ' tooShort{the supplied string is too short: {COUNT} {COUNT, plural, one{character} other{characters}} long}' +
  ' tooLong{the supplied string is too long: {COUNT} {COUNT, plural, one{character} other{characters}} long}' +
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

  var validationType;
  if (options.min !== undefined && options.min === options.max) {
    validationType = 'exactly';
  } else if (options.min !== undefined && options.max !== undefined) {
    validationType = 'between';
  } else if (options.min !== undefined) {
    validationType = 'atLeast';
  } else {
    validationType = 'atMost';
  }

  function getMessageParameters(context, cause) {
    return {
      VALIDATION_TYPE: validationType,
      MIN: options.min,
      MAX: options.max,
      CAUSE: cause,
      COUNT: _.isString(context.get('value')) ? context.get('value').length : undefined,
      VALUE_TYPE: typeof(context.get('value'))
    };
  }

  return function(context) {

    var cause,
        messageParameters,
        value = context.get('value');

    if (!_.isString(value)) {
      cause = 'wrongType';
      messageParameters = getMessageParameters(context, 'wrongType');
    } else if (options.min !== undefined && value.length < options.min) {
      cause = 'tooShort';
      messageParameters = getMessageParameters(context, 'tooShort');
    } else if (options.max !== undefined && value.length > options.max) {
      cause = 'tooLong';
      messageParameters = getMessageParameters(context, 'tooLong');
    }

    if (messageParameters) {
      context.addError({
        validator: 'stringLength',
        cause: cause,
        message: defaultMessage,
        messageParameters: messageParameters
      });
    }
  };
}
