import _ from 'lodash';
import BPromise from 'bluebird';
import { resolve } from '../utils';

export default function helpersPlugin() {
  return function(valdsl) {
    valdsl.dsl.extend({
      property: getValueProperty,
      value: setValue
    });
  };
}

export class ValidationValue {
  constructor(value, valueSet) {
    this.value = value;
    this.valueSet = valueSet;
  }
}

export function getValueProperty(path) {
  return function(context) {
    return resolve(path, context).then(resolvedPath => {
      context.set({
        value: _.get(context.get('value'), resolvedPath),
        valueSet: _.has(context.get('value'), resolvedPath)
      });
    });
  };
}

export function setValue(value, valueSet) {
  return function(context) {
    return BPromise.all([ resolve(value, context), resolve(valueSet, context) ]).spread((resolvedValue, resolvedValueSet) => {
      if (resolvedValue instanceof ValidationValue) {
        resolvedValueSet = resolvedValue.valueSet;
        resolvedValue = resolvedValue.value;
      }

      context.set({
        value: resolvedValue,
        valueSet: resolvedValueSet !== undefined ? resolvedValueSet : resolvedValue !== undefined
      });
    });
  };
}
