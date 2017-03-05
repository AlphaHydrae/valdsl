import _ from 'lodash';
import BPromise from 'bluebird';
import ValidationError from './error';
import ValidationErrorBundle from './error-bundle';

const DSL = Symbol('dsl');
const ERRORS = Symbol('errors');
const STATE = Symbol('state');
const ERROR_CLASS = Symbol('error-class');
const ERROR_BUNDLE_CLASS = Symbol('error-bundle-class');

export default class ValidationContext {

  constructor(options) {
    options = _.extend({}, options);
    if (_.has(options, 'state') && !_.isObject(options.state)) {
      throw new Error('Validation context `state` option must be an object');
    }

    this[ERRORS] = [];
    this[DSL] = options.dsl ? Object.create(options.dsl) : {};
    this[STATE] = options.state ? Object.create(options.state) : {};
    this[ERROR_CLASS] = options.ValidationError || ValidationError;
    this[ERROR_BUNDLE_CLASS] = options.ValidationErrorBundle || ValidationErrorBundle;

    this.initialize();
  }

  initialize() {
  }

  set(key, value) {
    if (_.isString(key) || _.isArray(key)) {
      _.set(this[STATE], key, value);
    } else if (_.isObject(key)) {
      for (let property in key) {
        this.set(property, key[property]);
      }
    } else {
      throw new Error('First argument must be a string, array or object');
    }

    return this;
  }

  get(key) {
    return _.get(this[STATE], key);
  }

  has(key) {
    return _.has(this[STATE], key);
  }

  pick(...properties) {
    return _.pick(this[STATE], properties);
  }

  remove(key) {
    _.unset(this[STATE], key);
    return this;
  }

  addError(properties) {
    this[ERRORS].push(this.createError(properties, Object.create(this[STATE])));
    return this;
  }

  createError(properties, state) {
    return new this[ERROR_CLASS](this.createErrorMessage(properties, state));
  }

  createErrorMessage(properties, state) {

    let message = properties.message || state.message || 'A validation error occurred';
    if (_.isFunction(message)) {
      message = message(_.merge({}, properties, state));
    }

    return message;
  }

  hasError(filter) {
    if (!this[ERRORS].length) {
      return false;
    }

    let predicate;
    if (_.isFunction(filter)) {
      predicate = error => filter(error, this);
    } else if (filter) {
      predicate = filter;
    } else {
      predicate = _.constant(true);
    }

    return _.find(this[ERRORS], predicate) !== undefined;
  }

  validate(...validators) {
    const child = this.createChild();
    return child.recursivelyValidate(_.flatten(validators));
  }

  ensureValid(...validators) {
    return this.validate(validators).then(() => {
      if (!this[ERRORS].length) {
        return this;
      }

      throw new this[ERROR_BUNDLE_CLASS]('A validation error occurred.', this[ERRORS].slice());
    });
  }

  createChild() {
    const newContext = Object.create(this);
    newContext[STATE] = Object.create(this[STATE]);
    return newContext;
  }

  recursivelyValidate(validators) {
    return validators.length ? this.runValidator(validators.shift()).then(() => this.recursivelyValidate(validators)) : BPromise.resolve(this);
  }

  runValidator(validator) {
    const dsl = _.defaults({ validate: this.validate.bind(this) }, this[DSL]);
    return BPromise.resolve(this).then(validator.bind(dsl));
  }
}
