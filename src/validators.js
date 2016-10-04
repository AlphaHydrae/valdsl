import _ from 'lodash';
import MessageFormat from 'messageformat';
import valib from 'valib';

var mf = new MessageFormat('en'),
    availableTypes = [ 'string', 'number', 'object', 'array', 'boolean' ];

var translations = {
  email: '{DESCRIPTION} must be a valid e-mail address.',
  format: '{DESCRIPTION} does not match the expected format{FORMAT_DESCRIPTION, select, undefined{} other{{FORMAT_DESCRIPTION}}}.',
  inclusion: '{DESCRIPTION} must be one of {ALLOWED_VALUES}.',
  presence: '{DESCRIPTION} is required.',
  stringLength: '{DESCRIPTION} must be a string '
    + '{VALIDATION_TYPE, select,'
    + ' exactly{exactly {MIN} {MIN, plural, one{character} other{characters}} long}'
    + ' atLeast{at least {MIN} {MIN, plural, one{character} other{characters}} long}'
    + ' atMost{at most {MAX} {MAX, plural, one{character} other{characters}} long}'
    + ' other{between {MIN} and {MAX} {MAX, plural, one{character} other{characters}} long}}'
    + '. '
    + '{ERROR, select,'
    + ' tooShort{The supplied string is too short ({COUNT} {COUNT, plural, one{character} other{characters}} long).}'
    + ' tooLong{The supplied string is {COUNT} {COUNT, plural, one{character} other{characters}} long.}'
    + ' other{The supplied value is of the wrong type ({VALUE_TYPE}).}}',
  type: '{DESCRIPTION} must be of type {TYPE}.',
  value: 'Value'
};

var compiledTranslations = mf.compile(translations);

export default {
  type: type,
  presence: presence,
  email: email,
  stringLength: stringLength,
  format: format,
  inclusion: inclusion
}

export function type() {

  var types = _.uniq(_.toArray(arguments));
  _.each(types, function(type) {
    if (!_.includes(availableTypes, type)) {
      throw new Error('Unknown validator type ' + JSON.stringify(type));
    }
  });

  var typeDescription = _.reduce(types, function(memo, type, i) {
    if (i > 0 && i == types.length - 1) {
      return memo + ' or ' + type;
    } else if (i != 0) {
      return memo + ', ' + type;
    } else {
      return type;
    }
  }, '');

  return function(context) {

    var value = context.state.value;
    if (value === undefined || value === null) {
      return;
    }

    var valid = _.includes(types, typeof(value));
    if (types.length == 1 && types[0] == 'array') {
      valid = _.isArray(value);
    }

    if (!valid) {
      context.addError({
        code: 'validation.type.invalid',
        message: compiledTranslations.type({
          DESCRIPTION: context.state.valueDescription || compiledTranslations.value()
        })
      });
    }
  };
};

export function presence() {
  return function(context) {
    if (!context.state.valueSet || !context.state.value) {
      context.addError({
        code: 'validation.presence.missing',
        message: compiledTranslations.presence({ DESCRIPTION: context.state.valueDescription || compiledTranslations.value() })
      });
    }
  }
};

export function email() {
  return function(context) {
    if (!_.isString(context.state.value) || !valib.String.isEmailLike(context.state.value)) {
      context.addError({
        code: 'validation.email.invalid',
        message: compiledTranslations.email({
          DESCRIPTION: context.state.valueDescription || compiledTranslations.value()
        })
      });
    }
  };
}

export function stringLength(min, max, options) {
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

  function getMessage(context, errorType) {
    return compiledTranslations.stringLength({
      VALIDATION_TYPE: validationType,
      MIN: options.min,
      MAX: options.max,
      ERROR: errorType,
      COUNT: _.isString(context.state.value) ? context.state.value.length : undefined,
      VALUE_TYPE: typeof(context.state.value),
      DESCRIPTION: context.state.valueDescription || compiledTranslations.value()
    });
  }

  return function(context) {

    var code,
        message,
        value = context.state.value;

    if (!_.isString(value)) {
      code = 'validation.stringLength.wrongType';
      message = getMessage(context, 'wrongType');
    } else if (options.min !== undefined && value.length < options.min) {
      code = 'validation.stringLength.tooShort';
      message = getMessage(context, 'tooShort');
    } else if (options.max !== undefined && value.length < options.max) {
      code = 'validation.stringLength.tooLong';
      message = getMessage(context, 'tooLong');
    }

    if (message) {
      context.addError({
        code: code,
        message: message
      });
    }
  };
};

export function format(regexp, formatDescription) {
  return function(context) {
    var value = context.state.value;
    if (!_.isString(value) || !value.match(regexp)) {
      context.addError({
        code: 'validation.format.invalid',
        message: compiledTranslations.format({
          DESCRIPTION: context.state.valueDescription || compiledTranslations.value(),
          FORMAT_DESCRIPTION: formatDescription
        })
      });
    }
  };
};

export function inclusion(options) {

  var allowedValues;
  if (_.isObject(options)) {
    allowedValues = options.in;
  } else {
    allowedValues = _.toArray(arguments);
  }

  return function(context) {
    if (!_.includes(allowedValues, context.state.value)) {
      context.addError({
        code: 'validation.inclusion.notIncluded',
        message: compiledTranslations.inclusion({
          DESCRIPTION: context.state.valueDescription || compiledTranslations.value(),
          ALLOWED_VALUES: allowedValues.join(', ')
        })
      });
    }
  };
};
