import _ from 'lodash';
import Promise from 'bluebird';

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
        return _.isFunction(condition) ? condition(context) : condition;
      });

      return Promise.all(pendingConditions).then(function(results) {
        return _.reduce(results, function(memo, result) {
          return memo && result;
        }, true);
      });
    });
  };

  _.extend(valdsl.dsl, {
    if: ifFunc,
    ifElse: ifElse,
    break: breakFunc,
    breakIf: breakIf,
    breakUnless: continueIf,
    continueIf: continueIf,
    continueUnless: breakIf,
    isSet: isSet,
    hasChanged: hasChanged,
    hasError: hasError
  });

  function ifFunc(condition, ...handlers) {
    return function(context) {
      Promise.resolve(_.isFunction(condition) ? condition() : condition).then(result => {
        if (!result) {
          return;
        }

        let promise = Promise.resolve();
        handlers.forEach(handler => promise = promise.return(context).then(handler));

        return promise;
      });
    };
  }

  function ifElse(condition, ifHandler, elseHandler) {
    if (ifHandler !== undefined && ifHandler !== null && ifHandler !== false && !_.isFunction(ifHandler)) {
      throw new Error('If handler must be a function');
    } else if (elseHandler !== undefined && elseHandler !== null && elseHandler !== false && !_.isFunction(elseHandler)) {
      throw new Error('Else handler must be a function');
    }

    return function(context) {
      Promise.resolve(_.isFunction(condition) ? condition() : condition).then(result => {
        if (result && ifHandler) {
          return ifHandler(context);
        } else if (!result && elseHandler) {
          return elseHandler(context);
        }
      });
    };
  }

  function breakFunc() {
    return function(context) {
      context.conditions.push(() => false);
    };
  }

  function continueIf(condition) {
    return function(context) {
      context.conditions.push(ctx => Promise.resolve(_.isFunction(condition) ? condition(ctx) : condition));
    };
  }

  function breakIf(condition) {
    return function(context) {
      context.conditions.push(ctx => Promise.resolve(_.isFunction(condition) ? condition(ctx) : condition).then(result => !result));
    };
  }

  function isSet() {
    return function(context) {
      return context.state.valueSet;
    };
  }

  function hasChanged(changed) {
    if (!_.isFunction(changed)) {
      var previousValue = changed;
      changed = function(value) {
        return value !== previousValue;
      };
    }

    return function(context) {
      return context.state.valueSet && changed(context.state.value);
    };
  }

  function hasError(filter) {
    return function(context) {
      return context.hasError(filter);
    };
  }
}
