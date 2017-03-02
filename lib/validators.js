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
exports.resource = resource;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _messageformat = require('messageformat');

var _messageformat2 = _interopRequireDefault(_messageformat);

var _valib = require('valib');

var _valib2 = _interopRequireDefault(_valib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mf = new _messageformat2.default('en'),
    availableTypes = ['string', 'number', 'object', 'array', 'boolean'];

var translations = {
  email: '{DESCRIPTION} must be a valid e-mail address.',
  format: '{DESCRIPTION} does not match the expected format{FORMAT_DESCRIPTION, select, undefined{} other{{FORMAT_DESCRIPTION}}}.',
  inclusion: '{DESCRIPTION} must be one of {ALLOWED_VALUES}.',
  presence: '{DESCRIPTION} is required.',
  stringLength: '{DESCRIPTION} must be a string ' + '{VALIDATION_TYPE, select,' + ' exactly{exactly {MIN} {MIN, plural, one{character} other{characters}} long}' + ' atLeast{at least {MIN} {MIN, plural, one{character} other{characters}} long}' + ' atMost{at most {MAX} {MAX, plural, one{character} other{characters}} long}' + ' other{between {MIN} and {MAX} {MAX, plural, one{character} other{characters}} long}}' + '. ' + '{ERROR, select,' + ' tooShort{The supplied string is too short ({COUNT} {COUNT, plural, one{character} other{characters}} long).}' + ' tooLong{The supplied string is {COUNT} {COUNT, plural, one{character} other{characters}} long.}' + ' other{The supplied value is of the wrong type ({VALUE_TYPE}).}}',
  type: '{DESCRIPTION} must be of type {TYPE}.',
  resource: '{DESCRIPTION} {ID} not found.',
  value: 'Value'
};

var compiledTranslations = mf.compile(translations);

exports.default = {
  type: type,
  presence: presence,
  email: email,
  stringLength: stringLength,
  format: format,
  inclusion: inclusion,
  resource: resource
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
        message: compiledTranslations.type({
          DESCRIPTION: context.state.valueDescription || compiledTranslations.value()
        })
      });
    }
  };
};

function presence() {
  return function (context) {
    if (!context.state.valueSet || !context.state.value) {
      context.addError({
        code: 'validation.presence.missing',
        message: compiledTranslations.presence({ DESCRIPTION: context.state.valueDescription || compiledTranslations.value() })
      });
    }
  };
};

function email() {
  return function (context) {
    if (!_lodash2.default.isString(context.state.value) || !_valib2.default.String.isEmailLike(context.state.value)) {
      context.addError({
        code: 'validation.email.invalid',
        message: compiledTranslations.email({
          DESCRIPTION: context.state.valueDescription || compiledTranslations.value()
        })
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
      COUNT: _lodash2.default.isString(context.state.value) ? context.state.value.length : undefined,
      VALUE_TYPE: _typeof(context.state.value),
      DESCRIPTION: context.state.valueDescription || compiledTranslations.value()
    });
  }

  return function (context) {

    var code,
        message,
        value = context.state.value;

    if (!_lodash2.default.isString(value)) {
      code = 'validation.stringLength.wrongType';
      message = getMessage(context, 'wrongType');
    } else if (options.min !== undefined && value.length < options.min) {
      code = 'validation.stringLength.tooShort';
      message = getMessage(context, 'tooShort');
    } else if (options.max !== undefined && value.length > options.max) {
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

function format(regexp, formatDescription) {
  return function (context) {
    var value = context.state.value;
    if (!_lodash2.default.isString(value) || !value.match(regexp)) {
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
        message: compiledTranslations.inclusion({
          DESCRIPTION: context.state.valueDescription || compiledTranslations.value(),
          ALLOWED_VALUES: allowedValues.join(', ')
        })
      });
    }
  };
};

function resource(loader, options) {
  options = _lodash2.default.extend({}, options);

  var action = function action(context) {
    return Promise.resolve(loader(context.state.value)).then(function (resource) {
      if (!resource) {
        return context.addError({
          code: 'validation.resource.notFound',
          message: compiledTranslations.resource({
            ID: context.state.value,
            DESCRIPTION: context.state.valueDescription || compiledTranslations.value()
          })
        });
      }

      if (options.replace && _lodash2.default.isFunction(context.state.location.setValue)) {
        context.state.location.setValue(_lodash2.default.isFunction(options.replace) ? options.replace(resource) : resource);
      }

      if (options.moveTo) {
        if (!context.state.location) {
          throw new Error('Moving the value requires a location');
        } else if (!_lodash2.default.isFunction(context.state.location.move)) {
          throw new Error('Moving the value requires the location to provide a `move` function');
        }

        context.changeState({
          location: context.state.location.move(options.moveTo)
        });
      }
    });
  };

  action.replace = function (by) {
    options.replace = by;
    return action;
  };

  action.moveTo = function (to) {
    options.moveTo = to;
    return action;
  };

  return action;
};