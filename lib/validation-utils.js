var _ = require('lodash'),
    Promise = require('bluebird');

exports.series = function() {
  return Promise.mapSeries(_.flatten(_.toArray(arguments)), _.identity);
};

exports.parallel = function() {
  return Promise.all(_.flatten(_.toArray(arguments)));
};
