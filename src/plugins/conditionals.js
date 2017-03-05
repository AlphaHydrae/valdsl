import _ from 'lodash';
import BPromise from 'bluebird';
import { resolve } from '../utils';

const CONDITIONS = Symbol('conditions');

export function validateIf(condition, ...handlers) {
  return function(context) {
    return resolve(condition, context).then(result => {
      if (!result) {
        return;
      }

      let promise = BPromise.resolve();
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
    return context.get('valueSet');
  };
}

export function previousValue(value) {
  return function(context) {
    context.set('previousValue', value);
  };
}

export function valueHasChanged(changed) {
  if (!_.isFunction(changed)) {
    const previousValue = changed;
    changed = function(value, context) {
      return value !== (previousValue !== undefined ? previousValue : context.get('previousValue'));
    };
  }

  return function(context) {
    return changed(context.get('value'), context);
  };
}

export function breakValidation() {
  return function(context) {
    context[CONDITIONS].push(() => false);
  };
}

export function validateWhile(condition) {
  return function(context) {
    context[CONDITIONS].push(ctx => resolve(condition, ctx));
  };
}

export function validateUntil(condition) {
  return function(context) {
    context[CONDITIONS].push(ctx => resolve(condition, ctx).then(result => !result));
  };
}

export default function conditionalsPlugin() {
  return function(valdsl) {

    valdsl.override('initialize', function(original) {
      return function initialize() {
        original.apply(this, arguments);
        this[CONDITIONS] = [];
      };
    });

    valdsl.override('createChild', function(original) {
      return function createChild() {
        const newContext = original.apply(this, arguments);
        newContext[CONDITIONS] = this[CONDITIONS].slice();
        return newContext;
      };
    });

    valdsl.override('shouldPerformNextAction', function(original) {
      return function shouldPerformNextAction() {
        return BPromise.resolve(original.apply(this, arguments)).then(yes => {
          if (!yes) {
            return false;
          }

          const pendingConditions = _.map(this[CONDITIONS] || [], condition => {
            return _.isFunction(condition) ? condition(this) : condition;
          });

          return BPromise.all(pendingConditions).then(function(results) {
            return _.reduce(results, function(memo, result) {
              return memo && result;
            }, true);
          });
        });
      };
    });

    valdsl.dsl.extend({
      if: validateIf,
      ifElse: validateIfElse,
      break: breakValidation,
      while: validateWhile,
      until: validateUntil,
      isSet: valueIsSet,
      hasChanged: valueHasChanged,
      previous: previousValue,
      hasError: hasError,
      hasNoError: hasNoError
    });
  };
}
