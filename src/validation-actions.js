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

export class JsonPointerLocation {
  constructor(basePointer, relativePointer, source) {
    this.basePointer = basePointer || '';
    this.relativePointer = relativePointer;
    this.source = source;
    this.type = 'jsonPointer';
  }

  at(relativePointer, source) {
    return new JsonPointerLocation(this.pointer + relativePointer, relativePointer, jsonPointer.get(source, this.relativePointer));
  }

  get pointer() {
    return this.basePointer + this.relativePointer;
  }

  move(newPointer) {
    if (jsonPointer.has(this.source, this.relativePointer)) {
      var value = jsonPointer.get(this.source, this.relativePointer);
      jsonPointer.remove(this.source, this.relativePointer);
      jsonPointer.set(this.source, newPointer, value);
    }

    return new JsonPointerLocation(this.basePointer, newPointer, this.source);
  }

  setValue(value) {
    jsonPointer.set(this.source, this.relativePointer, value);
  }

  toString() {
    return this.pointer;
  }
}

export function json(pointer, options) {
  options = _.extend({}, options);

  return function(context) {

    var basePointer;
    if (_.get(context.state, 'location.type') == 'jsonPointer') {
      basePointer = context.state.location.pointer;
    } else {
      basePointer = '';
    }

    var previousValue = context.state.value,
        valueSet = _.has(options, 'valueSet') ? options.valueSet : jsonPointer.has(previousValue, pointer);

    var value = options.value;
    if (!_.has(options, 'value') && valueSet) {
      value = jsonPointer.get(previousValue, pointer);
    }

    function setValue(newValue, newPointer) {
      if (newPointer) {
        jsonPointer.remove(previousValue, pointer);
      }

      jsonPointer.set(previousValue, newPointer || pointer, newValue);
    }

    context.changeState({
      type: 'json',
      location: newLocation,
      value: value,
      valueSet: valueSet,
      setValue: setValue
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
