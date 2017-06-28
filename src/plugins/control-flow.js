import _ from 'lodash';
import BPromise from 'bluebird';

export function parallel(...validators) {
  return function(context) {
    return BPromise.all(_.map(validators, (validator) => validator(context)));
  };
}

export function series(...args) {
  return function(context) {
    return BPromise.mapSeries(args, function(validator) {
      return BPromise.resolve(validator(context));
    });
  };
}

export default function defaultValidatorsPlugin() {
  return function(valdsl) {
    valdsl.dsl.extend({
      parallel: parallel,
      series: series
    });
  };
}
