'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
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

function json(pointer, value, valueSet) {
  return function (context) {

    var baseLocation = '';
    if (context.state.type == 'json' && context.state.location) {
      baseLocation = context.state.location;
    }

    var newLocation = baseLocation;
    if (pointer) {
      newLocation += pointer;
    }

    valueSet = valueSet !== undefined ? valueSet : _jsonPointer2.default.has(context.state.value, pointer);

    if (value === undefined && valueSet) {
      value = _jsonPointer2.default.get(context.state.value, pointer);
    }

    var previousValue = context.state.value;
    function setValue(newValue, newPointer) {
      if (newPointer) {
        _jsonPointer2.default.remove(previousValue, pointer);
      }

      _jsonPointer2.default.set(previousValue, newPointer || pointer, newValue);
    }

    context.changeState({
      type: 'json',
      location: newLocation,
      value: value,
      valueSet: valueSet,
      setValue: setValue
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