var _ = require('lodash');

module.exports = function(ValidationContext) {

  var proto = ValidationContext.prototype,
      initialize = proto.initialize,
      copy = proto.copy,
      shouldPerformNextAction = proto.shouldPerformNextAction;

  proto.initialize = function() {
    initialize.apply(this, arguments);
    this.conditions = [];
  };

  proto.copy = function() {
    var newContext = copy.apply(this, arguments);
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
        return condition(context);
      });

      return Promise.all(pendingConditions).then(function(results) {
        return _.reduce(results, function(memo, result) {
          return memo && result;
        }, true);
      });
    });
  };

  ValidationContext.extend({
    unlessError: function(filter) {
      return function(context) {
        context.conditions.push(function(context) {
          return !context.hasError(filter);
        });
      };
    }
  });
};
