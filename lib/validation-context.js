var _ = require('lodash'),
    extend = require('./extend'),
    Promise = require('bluebird'),
    ValidationError = require('./validation-error');

function ValidationContext(options) {

  options = _.extend({}, options);
  if (_.has(options, 'state') && !_.isObject(options.state)) {
    throw new Error('Validation context `state` option must be an object');
  }

  this.errors = [];
  this.history = [];
  this.state = options.state || {};

  this.initialize();
}

ValidationContext.extend = extend;
ValidationContext.unextend = extend.unextend;

ValidationContext.use = function(callback) {
  callback(ValidationContext);
  return ValidationContext;
};

_.extend(ValidationContext.prototype, {

  initialize: _.noop,

  addError: function(error) {
    this.errors.push(_.extend(error, this.state));
    return this;
  },

  hasError: function(filter) {
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
  },

  validate: function() {

    var newContext = this.copy(),
        actions = _.toArray(arguments);

    return recursivelyValidate(newContext, actions);
  },

  changeState: function(changes) {
    this.history.push(this.state);
    this.state = _.extend({}, this.state, changes);
  },

  setState: function(newState) {
    this.history.push(this.state);
    this.state = newState;
  },

  popState: function() {
    this.state = _.last(this.history);
    this.history.pop();
    return this;
  },

  ensureValid: function(callback) {
    var context = this;
    return Promise.resolve(this).then(_.bind(callback || _.noop, this)).then(function() {
      if (!context.errors.length) {
        return context;
      }

      var error = new ValidationError('A validation error occurred.');
      error.errors = _.map(context.errors, _.bind(context.serializeError, context));
      throw error;
    });
  },

  shouldPerformNextAction: function(action) {
    return true;
  },

  serializeError: function(error) {
    return error;
  },

  copy: function() {
    var newContext = new this.constructor();
    newContext.state = _.clone(this.state);
    newContext.history = this.history.slice();
    newContext.errors = this.errors;
    return newContext;
  }
});

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

module.exports = ValidationContext;
