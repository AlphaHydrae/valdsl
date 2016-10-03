'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _validationActions = require('./validation-actions');

var _validationActions2 = _interopRequireDefault(_validationActions);

var _conditionals = require('./plugins/conditionals');

var _conditionals2 = _interopRequireDefault(_conditionals);

var _validationUtils = require('./validation-utils');

var _validationUtils2 = _interopRequireDefault(_validationUtils);

var _validationContext = require('./validation-context');

var _validationContext2 = _interopRequireDefault(_validationContext);

var _validationError = require('./validation-error');

var _validationError2 = _interopRequireDefault(_validationError);

var _validators = require('./validators');

var _validators2 = _interopRequireDefault(_validators);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_validationContext2.default.extend(_validationActions2.default);
_validationContext2.default.extend(_validationUtils2.default);
_validationContext2.default.extend(_validators2.default);
_validationContext2.default.use(_conditionals2.default);

function validate(options, callback) {
  if (_lodash2.default.isFunction(options)) {
    callback = options;
    options = undefined;
  }

  return new _validationContext2.default(options).ensureValid(callback);
}

validate.ValidationContext = _validationContext2.default;
validate.ValidationError = _validationError2.default;

exports.default = validate;