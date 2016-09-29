var _ = require('lodash');

var names = [];

module.exports = function() {
  var proto = this.prototype;
  _.each(_.toArray(arguments), function(extensions) {
    _.each(extensions, function(value, key) {
      if (_.has(proto, key)) {
        throw new Error('Validation context prototype already has a `' + key + '` property');
      }

      names.push(key);
      proto[key] = value;
    });
  });
};

module.exports.unextend = function() {

  var toRemove = _.toArray(arguments);
  if (!toRemove.length) {
    toRemove = names;
  }

  var proto = this.prototype;
  _.each(toRemove, function(name) {
    delete proto[name];
  });
};
