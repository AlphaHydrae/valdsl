import _ from 'lodash';
import conditionalsPlugin from './plugins/conditionals';
import controlFlowPlugin from './plugins/control-flow';
import dataPlugin from './plugins/data';
import defaultValidatorsPlugin from './plugins/default-validators';
import helpersPlugin from './plugins/helpers';
import jsonPointerPlugin from './plugins/json-pointer';
import locationPlugin from './plugins/location';
import requestHeaderPlugin from './plugins/request-header';
import serializePlugin from './plugins/serialize';
import ValidationContext from './context';
import ValidationDsl from './dsl';
import ValidationError from './error';
import ValidationErrorBundle from './error-bundle';

export default function(options) {
  options = _.defaults({}, options, {
    plugins: {}
  });

  class CustomValidationContext extends ValidationContext {}
  class CustomValidationError extends ValidationError {}
  class CustomValidationErrorBundle extends ValidationErrorBundle {}

  const valdsl = {
    dsl: new ValidationDsl(),
    ValidationContext: CustomValidationContext,
    ValidationError: CustomValidationError,
    ValidationErrorBundle: CustomValidationErrorBundle
  };

  valdsl.override = function(contextMethod, callback) {

    const proto = valdsl.ValidationContext.prototype;
    const functionToOverride = proto[contextMethod];

    const newMethod = callback(functionToOverride);
    if (!_.isFunction(newMethod)) {
      throw new Error('Callback passed to override must return a function');
    }

    proto[contextMethod] = newMethod;

    return valdsl;
  };

  valdsl.plugins = {
    conditionals: conditionalsPlugin,
    controlFlow: controlFlowPlugin,
    data: dataPlugin,
    defaultValidators: defaultValidatorsPlugin,
    helpers: helpersPlugin,
    jsonPointer: jsonPointerPlugin,
    location: locationPlugin,
    requestHeader: requestHeaderPlugin,
    serialize: serializePlugin
  };

  valdsl.plugin = function(nameOrFunc, ...args) {
    if (_.isFunction(nameOrFunc)) {
      nameOrFunc(valdsl);
    } else if (_.isString(nameOrFunc) && valdsl.plugins[nameOrFunc]) {
      valdsl.plugins[nameOrFunc].apply(undefined, args)(valdsl);
    } else {
      throw new Error('Plugin must either be a function or the name of a core plugin');
    }

    return valdsl;
  };

  valdsl.plugin('helpers');
  valdsl.plugin('controlFlow');
  valdsl.plugin('data');
  valdsl.plugin('defaultValidators');
  valdsl.plugin('conditionals');
  valdsl.plugin('location');
  valdsl.plugin('jsonPointer');
  valdsl.plugin('requestHeader');
  valdsl.plugin('serialize');

  const valdslFunc = function validate(options, callback) {
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    options = _.defaults({}, options, _.pick(valdsl, 'dsl', 'ValidationError', 'ValidationErrorBundle'));

    return new valdsl.ValidationContext(options).ensureValid(callback);
  };

  _.extend(valdslFunc, valdsl);

  return valdslFunc;
}
