var _ = require('lodash'),
    valib = require('valib');

var availableTypes = [ 'string', 'number', 'object', 'array', 'boolean' ];

exports.type = function() {

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
        message: (context.state.valueDescription || 'Value') + ' must be of type ' + typeDescription + '.'
      });
    }
  };
};

exports.presence = function() {
  return function(context) {
    if (!context.state.valueSet || !context.state.value) {
      context.addError({
        code: 'validation.presence.missing',
        message: (context.state.valueDescription || 'Value') + ' is required.'
      });
    }
  }
};

exports.email = function() {
  return function(context) {
    if (!_.isString(context.state.value) || !valib.String.isEmailLike(context.state.value)) {
      context.addError({
        code: 'validation.email.invalid',
        message: (context.state.valueDescription || 'Value') + ' must be a valid e-mail address.'
      });
    }
  };
}

exports.stringLength = function(min, max, options) {
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

  return function(context) {

    var code,
        message,
        value = context.state.value;

    if (!_.isString(value)) {
      code = 'validation.stringLength.wrongType';
      message = buildStringLengthErrorMessage(context, options, 'The supplied value is of type ' + typeof(value) + '.');
    } else if (options.min !== undefined && value.length < options.min) {
      code = 'validation.stringLength.tooShort';
      message = buildStringLengthErrorMessage(context, options, 'The supplied string is ' + value.length + ' characters long.');
    } else if (options.max !== undefined && value.length < options.max) {
      code = 'validation.stringLength.tooLong';
      message = buildStringLengthErrorMessage(context, options, 'The supplied string is ' + value.length + ' characters long.');
    }

    if (message) {
      context.addError({
        code: code,
        message: message
      });
    }
  };
};

function buildStringLengthErrorMessage(context, options, errorDescription) {

  var description = (context.state.valueDescription || 'Value'),
      message = description + ' must be a string ';

  if (options.min !== undefined && options.min === options.max) {
    message += 'exactly ' + options.min + ' characters long.';
  } else if (options.min !== undefined && options.max !== undefined) {
    message += 'between ' + options.min + ' and ' + options.max + ' characters long.';
  } else if (options.min !== undefined) {
    message += 'at least ' + options.min + ' characters long.';
  } else if (options.max !== undefined) {
    message += 'at most ' + options.max + ' characters long.';
  }

  return message + ' ' + errorDescription;
}

exports.format = function(regexp, formatDescription) {
  return function(context) {
    var value = context.state.value;
    if (!_.isString(value) || !value.match(regexp)) {
      context.addError({
        code: 'validation.format.invalid',
        message: (context.state.valueDescription || 'Value') + ' does not match the expected format' + (formatDescription ? '(' + formatDescription + ')' : '') + '.'
      });
    }
  };
};

exports.inclusion = function(options) {

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
        message: (context.state.valueDescription || 'Value') + ' must be one of ' + allowedValues.join(', ') + '.'
      });
    }
  };
};
