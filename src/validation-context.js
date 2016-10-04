import _ from 'lodash';
import extend from './extend';
import Promise from 'bluebird';
import ValidationError from './validation-error';

export default class ValidationContext {

  static use(callback) {
    callback(ValidationContext);
    return ValidationContext;
  }

  constructor(options) {
    options = _.extend({}, options);
    if (_.has(options, 'state') && !_.isObject(options.state)) {
      throw new Error('Validation context `state` option must be an object');
    }

    this.errors = [];
    this.history = [];
    this.state = options.state || {};

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

  validate() {

    var newContext = this.createChild(),
        actions = _.toArray(arguments);

    return recursivelyValidate(newContext, actions);
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
    var context = this;
    return Promise.resolve(this).then(_.bind(callback || _.noop, this)).then(function() {
      if (!context.errors.length) {
        return context;
      }

      var error = new ValidationError('A validation error occurred.');
      error.errors = _.map(context.errors, _.bind(context.serializeError, context));
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
    newContext.errors = this.errors;
    return newContext;
  }
}

ValidationContext.extend = extend;
ValidationContext.unextend = extend.unextend;

function recursivelyValidate(context, actions, promise) {
  if (!promise) {
    return recursivelyValidate(context, actions, Promise.resolve());
  } else if (!actions.length) {
    return promise;
  }

  var nextAction = actions.shift();
  return Promise.resolve(context.shouldPerformNextAction(nextAction)).then(function(yes) {
    if (yes) {
      return promise.return(context).then(_.bind(nextAction, context)).then(function() {
        return recursivelyValidate(context, actions);
      });
    } else {
      return promise;
    }
  });
}
