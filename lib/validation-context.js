'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _extendDsl2 = require('./extend-dsl');

var _extendDsl3 = _interopRequireDefault(_extendDsl2);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _validationError = require('./validation-error');

var _validationError2 = _interopRequireDefault(_validationError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ValidationContext = function () {
  _createClass(ValidationContext, null, [{
    key: 'extendDsl',
    value: function extendDsl() {
      return _extendDsl3.default.apply(this, arguments);
    }
  }]);

  function ValidationContext(options) {
    _classCallCheck(this, ValidationContext);

    options = _lodash2.default.extend({}, options);
    if (_lodash2.default.has(options, 'state') && !_lodash2.default.isObject(options.state)) {
      throw new Error('Validation context `state` option must be an object');
    }

    this.errors = [];
    this.history = [];
    this.state = options.state || {};

    this.initialize();
  }

  _createClass(ValidationContext, [{
    key: 'initialize',
    value: function initialize() {}
  }, {
    key: 'addError',
    value: function addError(error) {
      this.errors.push(_lodash2.default.extend(error, this.state));
      return this;
    }
  }, {
    key: 'hasError',
    value: function hasError(filter) {
      if (!this.errors.length) {
        return false;
      }

      var predicate;
      if (_lodash2.default.isFunction(filter)) {
        var context = this;
        predicate = function predicate(error) {
          return filter(error, context);
        };
      } else if (filter) {
        predicate = filter;
      } else {
        predicate = _lodash2.default.constant(true);
      }

      return _lodash2.default.find(this.errors, predicate) !== undefined;
    }
  }, {
    key: 'validate',
    value: function validate() {

      var newContext = this.createChild(),
          actions = _lodash2.default.toArray(arguments);

      return recursivelyValidate(newContext, actions);
    }
  }, {
    key: 'changeState',
    value: function changeState(changes) {
      this.history.push(this.state);
      this.state = _lodash2.default.extend({}, this.state, changes);
    }
  }, {
    key: 'setState',
    value: function setState(newState) {
      this.history.push(this.state);
      this.state = newState;
    }
  }, {
    key: 'popState',
    value: function popState() {
      this.state = _lodash2.default.last(this.history);
      this.history.pop();
      return this;
    }
  }, {
    key: 'ensureValid',
    value: function ensureValid(callback) {
      var context = this;
      return _bluebird2.default.resolve(this).then(_lodash2.default.bind(callback || _lodash2.default.noop, this)).then(function () {
        if (!context.errors.length) {
          return context;
        }

        var error = new _validationError2.default('A validation error occurred.');
        error.errors = _lodash2.default.map(context.errors, _lodash2.default.bind(context.serializeError, context));
        throw error;
      });
    }
  }, {
    key: 'shouldPerformNextAction',
    value: function shouldPerformNextAction(action) {
      return true;
    }
  }, {
    key: 'serializeError',
    value: function serializeError(error) {
      return error;
    }
  }, {
    key: 'createChild',
    value: function createChild() {
      var newContext = Object.create(this);
      newContext.state = _lodash2.default.clone(this.state);
      newContext.history = this.history.slice();
      newContext.errors = this.errors;
      return newContext;
    }
  }]);

  return ValidationContext;
}();

exports.default = ValidationContext;


function recursivelyValidate(context, actions, promise) {
  if (!promise) {
    return recursivelyValidate(context, actions, _bluebird2.default.resolve());
  } else if (!actions.length) {
    return promise;
  }

  var nextAction = actions.shift();
  return _bluebird2.default.resolve(context.shouldPerformNextAction(nextAction)).then(function (yes) {
    if (yes) {
      return promise.return(context).then(_lodash2.default.bind(nextAction, context)).then(function () {
        return recursivelyValidate(context, actions);
      });
    } else {
      return promise;
    }
  });
}