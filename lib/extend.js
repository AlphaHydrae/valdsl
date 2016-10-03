'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {

  var proto = this.prototype;
  _lodash2.default.each(_lodash2.default.toArray(arguments), function (extensions) {
    _lodash2.default.each(extensions, function (value, key) {
      if (_lodash2.default.has(proto, key)) {
        throw new Error('Validation context prototype already has a `' + key + '` property');
      }

      names.push(key);
      proto[key] = value;
    });
  });
};

exports.unextend = unextend;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var names = [];

;

function unextend() {

  var toRemove = _lodash2.default.toArray(arguments);
  if (!toRemove.length) {
    toRemove = names;
  }

  var proto = this.prototype;
  _lodash2.default.each(toRemove, function (name) {
    delete proto[name];
  });
};