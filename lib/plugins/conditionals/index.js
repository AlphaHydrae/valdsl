'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (valdsl) {

  var proto = valdsl.ValidationContext.prototype,
      createChild = proto.createChild,
      initialize = proto.initialize,
      shouldPerformNextAction = proto.shouldPerformNextAction;

  proto.initialize = function () {
    initialize.apply(this, arguments);
    this.conditions = [];
  };

  proto.createChild = function () {
    var newContext = createChild.apply(this, arguments);
    newContext.conditions = this.conditions.slice();
    return newContext;
  };

  proto.shouldPerformNextAction = function () {
    var context = this;
    return Promise.resolve(shouldPerformNextAction.apply(this, arguments)).then(function (yes) {
      if (!yes) {
        return false;
      }

      var pendingConditions = _lodash2.default.map(context.conditions || [], function (condition) {
        return condition(context);
      });

      return Promise.all(pendingConditions).then(function (results) {
        return _lodash2.default.reduce(results, function (memo, result) {
          return memo && result;
        }, true);
      });
    });
  };

  valdsl.ValidationContext.extendDsl({
    ifSet: ifSet,
    ifChanged: ifChanged,
    unlessError: unlessError
  });

  function ifSet() {
    return function (context) {
      context.conditions.push(function (context) {
        return context.state.valueSet;
      });
    };
  }

  function ifChanged(changed) {
    if (!_lodash2.default.isFunction(changed)) {
      var previousValue = changed;
      changed = function changed(value) {
        return value !== previousValue;
      };
    }

    return function (context) {
      context.conditions.push(function (context) {
        return context.state.valueSet && changed(context.state.value);
      });
    };
  }

  function unlessError(filter) {
    return function (context) {
      context.conditions.push(function (context) {
        return !context.hasError(filter);
      });
    };
  }
};

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }