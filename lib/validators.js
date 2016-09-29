var _ = require('lodash'),
    valib = require('valib');

var availableTypes = [ 'string', 'number', 'object', 'array', 'boolean' ];

exports.type = function() {

  var types = _.uniq(_.toArray(arguments));
  _.each(types, function(type) {
    if (!_.includes(availableTypes, type)) {
      throw new Error('Unknown validator type ' + JSON.stringify(type));
    }
  });

  var typeDescription = _.reduce(types, function(memo, type, i) {
    if (i > 0 && i == types.length - 1) {
      return memo + ' or ' + type;
    } else if (i != 0) {
      return memo + ', ' + type;
    } else {
      return type;
    }
  }, '');

  return function(context) {

    var value = context.state.value;
    if (value === undefined || value === null) {
      return;
    }

    var valid = _.includes(types, typeof(value));
    if (types.length == 1 && types[0] == 'array') {
      valid = _.isArray(value);
    }

    if (!valid) {
      context.addError({
        code: 'validation.type.invalid',
        message: (context.state.valueDescription || 'Value') + ' must be of type ' + typeDescription + '.'
      });
    }
  };
};

exports.presence = function() {
  return function(context) {
    if (!context.state.valueSet || !context.state.value) {
      context.addError({
        code: 'validation.presence.missing',
        message: (context.state.valueDescription || 'Value') + ' is required.'
      });
    }
  }
};

exports.email = function() {
  return function(context) {
    if (!_.isString(context.state.value) || !valib.String.isEmailLike(context.state.value)) {
      context.addError({
        code: 'validation.email.invalid',
        message: (context.state.valueDescription || 'Value') + ' must be a valid e-mail address.'
      });
    }
  };
}
