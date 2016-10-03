'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.type = type;
exports.presence = presence;
exports.email = email;
exports.stringLength = stringLength;
exports.format = format;
exports.inclusion = inclusion;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _valib = require('valib');

var _valib2 = _interopRequireDefault(_valib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var availableTypes = ['string', 'number', 'object', 'array', 'boolean'];

exports.default = {
  type: type,
  presence: presence,
  email: email,
  stringLength: stringLength,
  format: format,
  inclusion: inclusion
};
function type() {

  var types = _lodash2.default.uniq(_lodash2.default.toArray(arguments));
  _lodash2.default.each(types, function (type) {
    if (!_lodash2.default.includes(availableTypes, type)) {
      throw new Error('Unknown validator type ' + JSON.stringify(type));
    }
  });

  var typeDescription = _lodash2.default.reduce(types, function (memo, type, i) {
    if (i > 0 && i == types.length - 1) {
      return memo + ' or ' + type;
    } else if (i != 0) {
      return memo + ', ' + type;
    } else {
      return type;
    }
  }, '');

  return function (context) {

    var value = context.state.value;
    if (value === undefined || value === null) {
      return;
    }

    var valid = _lodash2.default.includes(types, typeof value === 'undefined' ? 'undefined' : _typeof(value));
    if (types.length == 1 && types[0] == 'array') {
      valid = _lodash2.default.isArray(value);
    }

    if (!valid) {
      context.addError({
        code: 'validation.type.invalid',
        message: (context.state.valueDescription || 'Value') + ' must be of type ' + typeDescription + '.'
      });
    }
  };
};

function presence() {
  return function (context) {
    if (!context.state.valueSet || !context.state.value) {
      context.addError({
        code: 'validation.presence.missing',
        message: (context.state.valueDescription || 'Value') + ' is required.'
      });
    }
  };
};

function email() {
  return function (context) {
    if (!_lodash2.default.isString(context.state.value) || !_valib2.default.String.isEmailLike(context.state.value)) {
      context.addError({
        code: 'validation.email.invalid',
        message: (context.state.valueDescription || 'Value') + ' must be a valid e-mail address.'
      });
    }
  };
}

function stringLength(min, max, options) {
  if (_lodash2.default.isObject(min)) {
    options = min;
  } else {
    options = _lodash2.default.defaults({}, options, {
      min: min,
      max: max
    });
  }

  if (options.min !== undefined && !_lodash2.default.isNumber(options.min)) {
    throw new Error('String length validator `min` option must be a number, got ' + _typeof(options.min));
  } else if (options.max !== undefined && !_lodash2.default.isNumber(options.max)) {
    throw new Error('String length validator `max` option must be a number, got ' + _typeof(options.max));
  }

  return function (context) {

    var code,
        message,
        value = context.state.value;

    if (!_lodash2.default.isString(value)) {
      code = 'validation.stringLength.wrongType';
      message = buildStringLengthErrorMessage(context, options, 'The supplied value is of type ' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)) + '.');
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

  var description = context.state.valueDescription || 'Value',
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

function format(regexp, formatDescription) {
  return function (context) {
    var value = context.state.value;
    if (!_lodash2.default.isString(value) || !value.match(regexp)) {
      context.addError({
        code: 'validation.format.invalid',
        message: (context.state.valueDescription || 'Value') + ' does not match the expected format' + (formatDescription ? '(' + formatDescription + ')' : '') + '.'
      });
    }
  };
};

function inclusion(options) {

  var allowedValues;
  if (_lodash2.default.isObject(options)) {
    allowedValues = options.in;
  } else {
    allowedValues = _lodash2.default.toArray(arguments);
  }

  return function (context) {
    if (!_lodash2.default.includes(allowedValues, context.state.value)) {
      context.addError({
        code: 'validation.inclusion.notIncluded',
        message: (context.state.valueDescription || 'Value') + ' must be one of ' + allowedValues.join(', ') + '.'
      });
    }
  };
};