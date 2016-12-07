import _ from 'lodash';

export default function(valdsl) {

  var proto = valdsl.ValidationContext.prototype,
      createChild = proto.createChild,
      initialize = proto.initialize,
      shouldPerformNextAction = proto.shouldPerformNextAction;

  proto.initialize = function() {
    initialize.apply(this, arguments);
    this.conditions = [];
  };

  proto.createChild = function() {
    var newContext = createChild.apply(this, arguments);
    newContext.conditions = this.conditions.slice();
    return newContext;
  };

  proto.shouldPerformNextAction = function() {
    var context = this;
    return Promise.resolve(shouldPerformNextAction.apply(this, arguments)).then(function(yes) {
      if (!yes) {
        return false;
      }

      var pendingConditions = _.map(context.conditions || [], function(condition) {
        return condition(context);
      });

      return Promise.all(pendingConditions).then(function(results) {
        return _.reduce(results, function(memo, result) {
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
    return function(context) {
      context.conditions.push(function(context) {
        return context.state.valueSet;
      });
    };
  }

  function ifChanged(changed) {
    if (!_.isFunction(changed)) {
      var previousValue = changed;
      changed = function(value) {
        return value !== previousValue;
      };
    }

    return function(context) {
      context.conditions.push(function(context) {
        return context.state.valueSet && changed(context.state.value);
      });
    };
  }

  function unlessError(filter) {
    return function(context) {
      context.conditions.push(function(context) {
        return !context.hasError(filter);
      });
    };
  }
};
