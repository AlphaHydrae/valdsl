import _ from 'lodash';

var names = [];

export default function() {

  const proto = this.prototype;
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

export function unextend() {

  var toRemove = _.toArray(arguments);
  if (!toRemove.length) {
    toRemove = names;
  }

  var proto = this.prototype;
  _.each(toRemove, function(name) {
    delete proto[name];
  });
};
