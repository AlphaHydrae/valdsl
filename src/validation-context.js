import _ from 'lodash';
import extendDsl from './extend-dsl';
import Promise from 'bluebird';
import ValidationError from './validation-error';

export default class ValidationContext {

  static extendDsl() {
    return extendDsl.apply(this, arguments);
  }

  constructor(options) {
    options = _.extend({}, options);
    if (_.has(options, 'state') && !_.isObject(options.state)) {
      throw new Error('Validation context `state` option must be an object');
    }

    const dsl = options.dsl || {};

    const reservedKeys = [];
    for (let name in dsl) {
      if (this[name] !== undefined) {
        reservedKeys.push(name);
      }
    }

    if (reservedKeys.length) {
      throw new Error(`The following names are reserved and cannot be used in the validation DSL: ${reservedKeys.join(', ')}`);
    }

    this.errors = [];
    this.history = [];
    this.state = options.state || {};
    this.dsl = dsl;

    this.initialize();
  }

  initialize() {
  }

  addError(error) {
    this.errors.push(_.extend(error, this.state));
    return this;
  }

  hasError(filter) {
    if (!this.errors.length) {
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

    return _.find(this.errors, predicate) !== undefined;
  }

  validate(...actions) {
    return recursivelyValidate(this.createChild(), actions);
  }

  changeState(changes) {
    this.history.push(this.state);
    this.state = _.extend({}, this.state, changes);
  }

  setState(newState) {
    this.history.push(this.state);
    this.state = newState;
  }

  popState() {
    this.state = _.last(this.history);
    this.history.pop();
    return this;
  }

  ensureValid(callback) {
    return this.validate(callback || _.noop).then(() => {
      if (!this.errors.length) {
        return this;
      }

      var error = new ValidationError('A validation error occurred.');
      error.errors = _.map(this.errors, _.bind(this.serializeError, this));
      throw error;
    });
  }

  shouldPerformNextAction(action) {
    return true;
  }

  serializeError(error) {
    return error;
  }

  createChild() {
    var newContext = Object.create(this);
    newContext.state = _.clone(this.state);
    newContext.history = this.history.slice();
    return newContext;
  }
}

function recursivelyValidate(context, actions, promise) {
  if (!promise) {
    return recursivelyValidate(context, actions, Promise.resolve());
  } else if (!actions.length) {
    return promise;
  }

  var nextAction = actions.shift();
  return Promise.resolve(context.shouldPerformNextAction(nextAction)).then(function(yes) {
    if (yes) {
      var dsl = _.extend(Object.create(context), context.dsl);
      return promise.return(context).then(_.bind(nextAction, dsl)).then(function() {
        return recursivelyValidate(context, actions);
      });
    } else {
      return promise;
    }
  });
}
