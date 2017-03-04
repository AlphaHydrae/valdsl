import _ from 'lodash';
import BPromise from 'bluebird';

export default {
  series: series,
  parallel: parallel
};

export function series() {
  return BPromise.mapSeries(_.flatten(_.toArray(arguments)), _.identity);
}

export function parallel() {
  return BPromise.all(_.flatten(_.toArray(arguments)));
}

export function resolve(value, ...args) {
  return BPromise.resolve(_.isFunction(value) ? value.apply(undefined, args) : value);
}
