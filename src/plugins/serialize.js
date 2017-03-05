import _ from 'lodash';

// TODO: allow only/except/function
export default function serializePlugin(...keys) {
  return function(valdsl) {
    valdsl.override('createError', function(original) {
      return function createError(properties, state) {

        const error = original.apply(this, arguments);
        if (keys.length == 1 && _.isFunction(keys[0])) {
          keys[0](error, properties, state);
          return error;
        }

        const allProperties = _.merge({}, properties, state);
        delete allProperties.message;

        if (keys.length) {
          return _.defaults(error, _.pick(allProperties, keys));
        } else {
          return _.defaults(error, allProperties);
        }
      };
    });
  };
}
