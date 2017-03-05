import _ from 'lodash';
import BPromise from 'bluebird';
import ValidationError from './error';
import ValidationErrorBundle from './error-bundle';

const ERRORS = Symbol('errors');
const STATE = Symbol('state');

export default class ValidationContext {

  constructor(options) {
    options = _.extend({}, options);
    if (_.has(options, 'state') && !_.isObject(options.state)) {
      throw new Error('Validation context `state` option must be an object');
    }

    this.dsl = options.dsl || {};

    this[ERRORS] = [];
    this[STATE] = options.state || {};

    this.initialize();
  }

  initialize() {
  }

  set(key, value) {
    if (_.isString(key) || _.isArray(key)) {
      _.set(this[STATE], key, value);
    } else if (_.isObject(key)) {
      for (var property in key) {
        this.set(property, key[property]);
      }
    } else {
      throw new Error('First argument must be a string, array or object');
    }

    return this;
  }

  get(key) {
    return _.get(this[STATE], key);
  }

  has(key) {
    return _.has(this[STATE], key);
  }

  pick(...properties) {
    return _.pick(this[STATE], properties);
  }

  remove(key) {
    _.unset(this[STATE], key);
    return this;
  }

  addError(error) {
    this[ERRORS].push(this.createError(error));
    return this;
  }

  createError(error) {

    let message = error.message;
    if (_.isFunction(message)) {
      message = message(error.messageParameters || {});
    }

    return _.extend(new ValidationError(message), _.omit(error, 'message'), this[STATE]);
  }

  hasError(filter) {
    if (!this[ERRORS].length) {
      return false;
    }

    var predicate;
    if (_.isFunction(filter)) {
      var context = this;
      predicate = function(error) {
        return filter(error, context);
      };
    } else if (filter) {
      predicate = filter;
    } else {
      predicate = _.constant(true);
    }

    return _.find(this[ERRORS], predicate) !== undefined;
  }

  validate(...actions) {
    return recursivelyValidate(this.createChild(), _.flatten(actions));
  }

  ensureValid(...actions) {
    return this.validate(actions).then(() => {
      if (!this[ERRORS].length) {
        return this;
      }

      throw new ValidationErrorBundle('A validation error occurred.', this[ERRORS].slice());
    });
  }

  shouldPerformNextAction(action) {
    return true;
  }

  createChild() {
    var newContext = Object.create(this);
    newContext[STATE] = Object.create(this[STATE]);
    return newContext;
  }
}

function recursivelyValidate(context, actions, promise) {
  if (!promise) {
    return recursivelyValidate(context, actions, BPromise.resolve());
  } else if (!actions.length) {
    return promise;
  }

  var nextAction = actions.shift();
  return BPromise.resolve(context.shouldPerformNextAction(nextAction)).then(function(yes) {
    if (yes) {
      var dsl = _.defaults({ validate: context.validate.bind(context) }, context.dsl);
      return promise.return(context).then(_.bind(nextAction, dsl)).then(function() {
        return recursivelyValidate(context, actions);
      });
    } else {
      return promise;
    }
  });
}
