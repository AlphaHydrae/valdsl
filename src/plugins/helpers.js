import _ from 'lodash';

export default function helpersPlugin() {
  return function(valdsl) {
    valdsl.dsl.extend({
      property: getValueProperty,
      value: setValue
    });
  };
}

export function getValueProperty(path) {
  return function(context) {
    context.set({
      value: _.get(context.get('value'), path),
      valueSet: _.has(context.get('value'), path)
    });
  };
}

export function setValue(value, valueSet) {
  return function(context) {
    context.set({
      value: value,
      valueSet: valueSet !== undefined ? valueSet : value !== undefined
    });
  };
}
