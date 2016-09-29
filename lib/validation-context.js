var _ = require('lodash'),
    extend = require('./extend'),
    jsonPointer = require('json-pointer'),
    Promise = require('bluebird'),
    ValidationError = require('./validation-error'),
    validators = require('./validators');

function ValidationContext(options) {

  options = _.extend({}, options);
  if (_.has(options, 'state') && !_.isObject(options.state)) {
    throw new Error('Validation context `state` option must be an object');
  }

  this.errors = [];
  this.history = [];
  this.state = options.state || {};
}

ValidationContext.extend = extend;
ValidationContext.unextend = extend.unextend;

_.extend(ValidationContext.prototype, {

  addError: function(error) {
    this.errors.push(_.extend(error, this.state));
    return this;
  },

  hasError: function(filter) {

    filter = filter || _.constant(true);

    var context = this;
    return _.filter(this.errors, function(error) {
      return filter(error, context);
    }).length >= 1;
  },

  validate: function() {

    var clone = this._clone(),
        actions = _.toArray(arguments);

    return _.reduce(actions, function(memo, action) {
      return memo.return(clone).then(_.bind(action, clone));
    }, Promise.resolve()).return(clone);
  },

  changeState: function(newState) {
    this.history.push(this.state);
    this.state = _.extend({}, this.state, newState);
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
      error.errors = context.errors;
      throw error;
    });
  },

  series: function() {
    return Promise.mapSeries(_.flatten(_.toArray(arguments)), _.identity);
  },

  parallel: function() {
    return Promise.all(_.flatten(_.toArray(arguments)));
  },

  _clone: function() {
    var clone = new this.constructor();
    clone.state = _.clone(this.state);
    clone.history = this.history.slice();
    clone.errors = this.errors;
    return clone;
  }
});

ValidationContext.extend(validators, {
  get: extractValue,
  header: extractHeader,
  json: extractJsonValue,
  value: changeContextValue
});

module.exports = ValidationContext;

function extractValue(path) {
  return function(context) {
    context.changeState({
      value: _.get(context.state.value, path),
      valueSet: _.has(context.state.value, path)
    });
  };
}

function extractHeader(name) {
  return function(context) {
    context.changeState({
      type: 'header',
      location: name,
      value: context.state.value.get(name),
      valueSet: context.state.value.get(name) !== undefined
    });
  };
}

function extractJsonValue(pointer, value, valueSet) {
  return function(context) {

    var baseLocation = '';
    if (context.state.type == 'json' && context.state.location) {
      baseLocation = context.state.location;
    }

    var newLocation = baseLocation;
    if (pointer) {
      newLocation += pointer;
    }

    valueSet = valueSet !== undefined ? valueSet : jsonPointer.has(context.state.value, pointer);

    if (value === undefined && valueSet) {
      value = jsonPointer.get(context.state.value, pointer);
    }

    context.changeState({
      type: 'json',
      location: newLocation,
      value: value,
      valueSet: valueSet
    });
  };
}

function changeContextValue(value) {
  return function(context) {
    context.changeState({
      value: value,
      valueSet: value !== undefined
    });
  };
}
