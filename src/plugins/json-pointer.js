import _ from 'lodash';
import jsonPointer from 'json-pointer';

export default function jsonPointerPlugin() {
  return function(valdsl) {
    valdsl.dsl.extend('json', navigateToJsonPointer);
  };
}

// TODO: allow to remove pointer
export class JsonPointerLocation {
  constructor(basePointer, relativePointer, source) {
    this.basePointer = basePointer || '';
    this.relativePointer = relativePointer;
    this.source = source;
    this.type = 'jsonPointer';
  }

  get pointer() {
    return this.basePointer + this.relativePointer;
  }

  move(newPointer) {
    if (jsonPointer.has(this.source, this.relativePointer)) {
      const value = jsonPointer.get(this.source, this.relativePointer);
      jsonPointer.remove(this.source, this.relativePointer);
      jsonPointer.set(this.source, newPointer, value);
    }

    return new JsonPointerLocation(this.basePointer, newPointer, this.source);
  }

  isValueSet() {
    return jsonPointer.has(this.source, this.relativePointer);
  }

  getValue() {
    return jsonPointer.get(this.source, this.relativePointer);
  }

  setValue(value) {
    jsonPointer.set(this.source, this.relativePointer, value);
  }

  toString() {
    return this.pointer;
  }
}

export function navigateToJsonPointer(pointer, options) {
  options = _.extend({}, options);

  return function(context) {

    let basePointer;
    if (context.get('location.type') == 'jsonPointer') {
      basePointer = context.get('location.pointer');
    } else {
      basePointer = '';
    }

    const location = new JsonPointerLocation(basePointer, pointer, context.get('value'));

    const valueSet = _.has(options, 'valueSet') ? options.valueSet : location.isValueSet();

    let value = options.value;
    if (!_.has(options, 'value') && valueSet) {
      value = location.getValue();
    }

    context.set({
      type: 'json',
      location: location,
      value: value,
      valueSet: valueSet
    });
  };
}
