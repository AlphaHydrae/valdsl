var _ = require('lodash'),
    jsonPointer = require('json-pointer');

module.exports = {
  get: extractValue,
  header: extractHeader,
  json: extractJsonValue,
  value: changeContextValue,
  atCurrentLocation: atCurrentLocationFilter
};

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

function atCurrentLocationFilter() {
  return function(error, context) {
    if (!context.state.type || !context.state.location) {
      return false;
    }

    return _.isMatch(error, _.pick(context.state, 'type', 'location'));
  };
}
