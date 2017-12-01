import _ from 'lodash';
import BPromise from 'bluebird';
import { resolve, toNativePromise } from '../utils';

export function parallel(...validators) {
  return function(context) {
    return Promise.all(_.map(validators, (validator) => validator(context)));
  };
}

export function series(...validators) {
  return function(context) {
    return toNativePromise(BPromise.mapSeries(validators, function(validator) {
      return validator(context);
    }));
  };
}

export function each(...validators) {
  return function(context) {
    const value = context.get('value');
    if (_.isArray(value) || _.isObject(value)) {
      const keys = _.isArray(value) ? _.map(value, (v, i) => i) : _.keys(value);
      return toNativePromise(BPromise.mapSeries(keys, (key) => {
        const keyValue = value[key];
        return BPromise.mapSeries(validators, validator => {
          return resolve(validator.call(this, context, keyValue, key), context);
        });
      }));
    }
  };
}

export function eachParallel(...validators) {
  return function(context) {
    const value = context.get('value');
    if (_.isArray(value) || _.isObject(value)) {
      return Promise.all(_.map(value, (value, key) => {
        return toNativePromise(BPromise.mapSeries(validators, validator => {
          return validator.call(this, context, value, key);
        }));
      }));
    }
  };
}

export default function defaultValidatorsPlugin() {
  return function(valdsl) {
    valdsl.dsl.extend({
      each: each,
      parallel: parallel,
      series: series
    });
  };
}
