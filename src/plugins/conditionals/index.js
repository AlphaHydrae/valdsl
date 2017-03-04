import _ from 'lodash';
import Promise from 'bluebird';
import { resolve } from '../../validation-utils';

export function validateIf(condition, ...handlers) {
  return function(context) {
    return resolve(condition, context).then(result => {
      if (!result) {
        return;
      }

      let promise = Promise.resolve();
      handlers.forEach(handler => promise = promise.return(context).then(handler));

      return promise;
    });
  };
}

export function validateIfElse(condition, ifHandler, elseHandler) {
  if (ifHandler !== undefined && ifHandler !== null && ifHandler !== false && !_.isFunction(ifHandler)) {
    throw new Error('If handler must be a function');
  } else if (elseHandler !== undefined && elseHandler !== null && elseHandler !== false && !_.isFunction(elseHandler)) {
    throw new Error('Else handler must be a function');
  }

  return function(context) {
    return resolve(condition, context).then(result => {
      if (result && ifHandler) {
        return ifHandler(context);
      } else if (!result && elseHandler) {
        return elseHandler(context);
      }
    });
  };
}

export function hasError(filter) {
  return function(context) {
    return context.hasError(filter);
  };
}

export function hasNoError(filter) {
  return function(context) {
    return !context.hasError(filter);
  };
}

export function valueIsSet() {
  return function(context) {
    return context.state.valueSet;
  };
}

export function valueHasChanged(changed) {
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

export function breakValidation() {
  return function(context) {
    context.conditions.push(() => false);
  };
}

export function validateWhile(condition) {
  return function(context) {
    context.conditions.push(ctx => resolve(condition, ctx));
  };
}

export function validateUntil(condition) {
  return function(context) {
    context.conditions.push(ctx => resolve(condition, ctx).then(result => !result));
  };
}

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
    if: validateIf,
    ifElse: validateIfElse,
    break: breakValidation,
    while: validateWhile,
    until: validateUntil,
    set: valueIsSet,
    changed: valueHasChanged,
    error: hasError,
    noError: hasNoError
  });
}
