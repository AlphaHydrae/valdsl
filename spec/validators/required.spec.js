import _ from 'lodash';
import { expect } from 'chai';
import requiredFactory from '../../src/validators/required';
import { expectErrorFactory, expectNoError, mockContext } from '../helper';

require('../helper');

const expectRequiredError = expectErrorFactory({ validator: 'required' });

describe('required validator', function() {

  let required;
  beforeEach(function() {
    required = requiredFactory();
  });

  it('should be a function', function() {
    expect(required).to.be.a('function');
  });

  const invalidValues = {
    'undefined': undefined,
    'null': null
  };

  _.each(invalidValues, (invalidValue, description) => {
    it(`should add an error for ${description}`, function() {
      const context = validate(invalidValue);
      expectRequiredError(context, { message: 'is required' });
    });
  });

  const validValues = {
    'a blank string': '   ',
    'a number': 42,
    'a string': 'foo',
    'a string with leading/trailing spaces': '  bar ',
    'a symbol': Symbol('qux'),
    'an array': [ null, 24, 'foo' ],
    'an empty array': [],
    'an empty object': {},
    'an empty string': '',
    'an empty symbol': Symbol(),
    'an error': new Error('bug'),
    'an object': { foo: 'bar' },
    'false': false,
    'true': true,
    'zero': 0
  };

  _.each(validValues, (validValue, description) => {
    it(`should not add any error for ${description}`, function() {
      const context = validate(validValue);
      expectNoError(context);
    });
  });

  function validate(value) {
    const context = mockContext({ value: value });
    required(context);
    return context;
  }
});
