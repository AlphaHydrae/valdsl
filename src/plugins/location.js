import _ from 'lodash';

export default function locationPlugin() {
  return function(valdsl) {

    const proto = valdsl.ValidationContext.prototype;
    const createError = proto.createError;

    proto.createError = function(properties, state) {

      const error = createError.apply(this, arguments);
      if (state.type && state.location) {
        error.type = state.type.toString();
        error.location = state.location.toString();
      }

      return error;
    };

    valdsl.dsl.extend('atCurrentLocation', atCurrentLocationFilter);
  };
}

export function atCurrentLocationFilter() {
  return function(error, context) {
    if (!context.has('type') || !context.has('location')) {
      return false;
    }

    return error.type == context.get('type') && error.location == context.get('location').toString();
  };
}

// TODO: atFilter with strict equality or type-specific comparison
