import _ from 'lodash';
import { expect } from 'chai';
import requiredFactory from '../../src/validators/required';
import { mockContext } from '../helper';

require('../helper');

describe('required', function() {

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
      const context = mockContext({ value: invalidValue });
      required(context);
      expectPresenceError(context, { message: 'is required' });
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
      const context = mockContext({ value: validValue });
      required(context);
      expectNoError(context);
    });
  });
});

function expectNoError(context) {
  expect(context.addError.notCalled).to.equal(true);
}

function expectPresenceError(context, error) {
  expect(context.addError.calledOnce).to.equal(true);
  expect(context.addError.thisValues[0]).to.equal(context);
  expect(context.addError.args[0]).to.eql([ _.extend(error, { validator: 'required' }) ]);
}
