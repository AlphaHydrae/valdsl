import _ from 'lodash';
import Promise from 'bluebird';

export default {
  series: series,
  parallel: parallel
};

export function series() {
  return Promise.mapSeries(_.flatten(_.toArray(arguments)), _.identity);
}

export function parallel() {
  return Promise.all(_.flatten(_.toArray(arguments)));
}
