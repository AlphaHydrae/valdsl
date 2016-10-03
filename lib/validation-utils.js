'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.series = series;
exports.parallel = parallel;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  series: series,
  parallel: parallel
};
function series() {
  return _bluebird2.default.mapSeries(_lodash2.default.flatten(_lodash2.default.toArray(arguments)), _lodash2.default.identity);
}

function parallel() {
  return _bluebird2.default.all(_lodash2.default.flatten(_lodash2.default.toArray(arguments)));
}