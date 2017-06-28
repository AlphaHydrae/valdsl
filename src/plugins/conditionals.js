import _ from 'lodash';
import BPromise from 'bluebird';
import { resolve } from '../utils';

const CONDITIONS = Symbol('conditions');

export default function conditionalsPlugin() {
  return function(valdsl) {

    // Attach an array of conditions to the validation context when it's created
    valdsl.override('initialize', function(original) {
      return function initialize() {
        original.apply(this, arguments);
        this[CONDITIONS] = [];
      };
    });

    // Make a isolated copy of the conditions array when a new child context is created
    // (each validation chain should have its own independent conditions)
    valdsl.override('createChild', function(original) {
      return function createChild() {
        const newContext = original.apply(this, arguments);
        newContext[CONDITIONS] = this[CONDITIONS].slice();
        return newContext;
      };
    });

    // Ensure all conditions are fulfilled at each step of a validation chain
    valdsl.override('recursivelyValidate', function(original) {
      return function recursivelyValidate(validators) {
        if (!validators.length) {
          return BPromise.resolve(this);
        }

        const pendingConditions = _.map(this[CONDITIONS], condition => resolve(condition, this));
        return BPromise.all(pendingConditions).then(results => {
          if (_.every(results)) {
            return this.runValidator(validators.shift()).then(() => this.recursivelyValidate(validators));
          } else {
            return this;
          }
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
      changed: valueHasChanged,
      previous: previousValue,
      error: hasError,
      noError: hasNoError
    });
  };
}

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
