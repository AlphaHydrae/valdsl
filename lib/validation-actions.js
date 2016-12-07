'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsonPointerLocation = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.desc = desc;
exports.get = get;
exports.header = header;
exports.json = json;
exports.value = value;
exports.atCurrentLocation = atCurrentLocation;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _jsonPointer = require('json-pointer');

var _jsonPointer2 = _interopRequireDefault(_jsonPointer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

exports.default = {
  desc: desc,
  get: get,
  header: header,
  json: json,
  value: value,
  atCurrentLocation: atCurrentLocation
};
function desc(description) {
  return function (context) {
    context.state.valueDescription = _lodash2.default.compact([context.state.valueDescription, description]).join(' ');
  };
}

function get(path) {
  return function (context) {
    context.changeState({
      value: _lodash2.default.get(context.state.value, path),
      valueSet: _lodash2.default.has(context.state.value, path)
    });
  };
}

function header(name) {
  return function (context) {
    context.changeState({
      type: 'header',
      location: name,
      value: context.state.value.get(name),
      valueSet: context.state.value.get(name) !== undefined
    });
  };
}

var JsonPointerLocation = exports.JsonPointerLocation = function () {
  function JsonPointerLocation(basePointer, relativePointer, source) {
    _classCallCheck(this, JsonPointerLocation);

    this.basePointer = basePointer || '';
    this.relativePointer = relativePointer;
    this.source = source;
    this.type = 'jsonPointer';
  }

  _createClass(JsonPointerLocation, [{
    key: 'move',
    value: function move(newPointer) {
      if (_jsonPointer2.default.has(this.source, this.relativePointer)) {
        var value = _jsonPointer2.default.get(this.source, this.relativePointer);
        _jsonPointer2.default.remove(this.source, this.relativePointer);
        _jsonPointer2.default.set(this.source, newPointer, value);
      }

      return new JsonPointerLocation(this.basePointer, newPointer, this.source);
    }
  }, {
    key: 'isValueSet',
    value: function isValueSet() {
      return _jsonPointer2.default.has(this.source, this.relativePointer);
    }
  }, {
    key: 'getValue',
    value: function getValue() {
      return _jsonPointer2.default.get(this.source, this.relativePointer);
    }
  }, {
    key: 'setValue',
    value: function setValue(value) {
      _jsonPointer2.default.set(this.source, this.relativePointer, value);
    }
  }, {
    key: 'toString',
    value: function toString() {
      return this.pointer;
    }
  }, {
    key: 'pointer',
    get: function get() {
      return this.basePointer + this.relativePointer;
    }
  }]);

  return JsonPointerLocation;
}();

function json(pointer, options) {
  options = _lodash2.default.extend({}, options);

  return function (context) {

    var basePointer;
    if (_lodash2.default.get(context.state, 'location.type') == 'jsonPointer') {
      basePointer = context.state.location.pointer;
    } else {
      basePointer = '';
    }

    var location = new JsonPointerLocation(basePointer, pointer, context.state.value);

    var valueSet = _lodash2.default.has(options, 'valueSet') ? options.valueSet : location.isValueSet();

    var value = options.value;
    if (!_lodash2.default.has(options, 'value') && valueSet) {
      value = location.getValue();
    }

    context.changeState({
      type: 'json',
      location: location,
      value: value,
      valueSet: valueSet
    });
  };
}

function value(value) {
  return function (context) {
    context.changeState({
      value: value,
      valueSet: value !== undefined
    });
  };
}

function atCurrentLocation() {
  return function (error, context) {
    if (!context.state.type || !context.state.location) {
      return false;
    }

    return _lodash2.default.isMatch(error, _lodash2.default.pick(context.state, 'type', 'location'));
  };
}