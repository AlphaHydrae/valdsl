import _ from 'lodash';
import BPromise from 'bluebird';
import { resolve, toNativePromise } from '../utils';

const DATA = Symbol('data');

export default function dataPlugin() {
  return function(valdsl) {

    valdsl.override('initialize', function(original) {
      return function initialize() {
        original.apply(this, arguments);
        this[DATA] = {};
      };
    });

    valdsl.override('setData', function() {
      return function setData(key, value) {
        if (_.isString(key) || _.isArray(key)) {
          return resolve(value).then((resolved) => {
            _.set(this[DATA], key, resolved);
            return resolved;
          });
        } else if (_.isObject(key)) {
          return Promise.all(_.map(_.keys(key), (property) => {
            return this.set(property, key[property]);
          }));
        } else {
          throw new Error('First argument must be a string, array or object');
        }
      };
    });

    valdsl.override('getData', function() {
      return function getData(...args) {
        return _.get(this[DATA], ...args);
      };
    });

    valdsl.dsl.extend({
      data: data
    });
  };
}

export function data(key, value) {
  return function(context) {
    return toNativePromise(BPromise.all([ resolve(key, context), resolve(value, context) ]).spread((resolvedKey, resolvedValue) => {
      return context.setData(resolvedKey, resolvedValue);
    }));
  };
}
