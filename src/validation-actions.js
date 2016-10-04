import _ from 'lodash';
import jsonPointer from 'json-pointer';

export default {
  desc: desc,
  get: get,
  header: header,
  json: json,
  value: value,
  atCurrentLocation: atCurrentLocation
}

export function desc(description) {
  return function(context) {
    context.state.valueDescription = _.compact([ context.state.valueDescription, description ]).join(' ');
  };
}

export function get(path) {
  return function(context) {
    context.changeState({
      value: _.get(context.state.value, path),
      valueSet: _.has(context.state.value, path)
    });
  };
}

export function header(name) {
  return function(context) {
    context.changeState({
      type: 'header',
      location: name,
      value: context.state.value.get(name),
      valueSet: context.state.value.get(name) !== undefined
    });
  };
}

export function json(pointer, value, valueSet) {
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

export function value(value) {
  return function(context) {
    context.changeState({
      value: value,
      valueSet: value !== undefined
    });
  };
}

export function atCurrentLocation() {
  return function(error, context) {
    if (!context.state.type || !context.state.location) {
      return false;
    }

    return _.isMatch(error, _.pick(context.state, 'type', 'location'));
  };
}
