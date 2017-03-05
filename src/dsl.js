import _ from 'lodash';

export default class ValidationDsl {
  extend(key, value) {
    if (_.isString(key)) {
      this[key] = checkDslProperty(this, key, value);
    } else if (_.isObject(key)) {
      for (let property in key) {
        this.extend(property, key[property]);
      }
    } else {
      throw new Error('First argument must be a string or an object');
    }
  }
}

function checkDslProperty(dsl, name, value) {
  if (dsl[name]) {
    throw new Error(`DSL property "${name}" is already taken`);
  } else if (!_.isFunction(value)) {
    throw new Error(`DSL property "${name}" must be a function (got ${typeof(value)})`);
  }

  return value;
}
