import _ from 'lodash';
import BPromise from 'bluebird';

export function parallel() {
  return BPromise.all(_.flatten(_.toArray(arguments)));
}

export function series() {
  return BPromise.mapSeries(_.flatten(_.toArray(arguments)), _.identity);
}

export default function defaultValidatorsPlugin() {
  return function(valdsl) {
    valdsl.dsl.extend({
      parallel: parallel,
      series: series
    });
  };
}
