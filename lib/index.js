'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var CustomValidationContext = function (_ValidationContext) {
    _inherits(CustomValidationContext, _ValidationContext);

    function CustomValidationContext() {
      _classCallCheck(this, CustomValidationContext);

      return _possibleConstructorReturn(this, (CustomValidationContext.__proto__ || Object.getPrototypeOf(CustomValidationContext)).apply(this, arguments));
    }

    return CustomValidationContext;
  }(_validationContext2.default);

  var dsl = function validate(options, callback) {
    if (_lodash2.default.isFunction(options)) {
      callback = options;
      options = undefined;
    }

    return new CustomValidationContext(options).ensureValid(callback);
  };

  dsl.ValidationContext = CustomValidationContext;
  dsl.ValidationError = _validationError2.default;

  dsl.plugin = function (callback) {
    callback(dsl);
    return dsl;
  };

  CustomValidationContext.extendDsl(_validationActions2.default);
  CustomValidationContext.extendDsl(_validationUtils2.default);
  CustomValidationContext.extendDsl(_validators2.default);

  dsl.plugin(_conditionals2.default);

  return dsl;
};

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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }