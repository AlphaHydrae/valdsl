import _ from 'lodash';
import { expect } from 'chai';
import notBlankFactory from '../../src/validators/notBlank';
import { expectErrorFactory, expectNoError, mockContext } from '../helper';

require('../helper');

const expectNotBlankError = expectErrorFactory({ validator: 'notBlank' });

describe('notBlank validator', function() {

  let validator;
  beforeEach(function() {
    validator = notBlankFactory({ message: 'must not be blank' });
  });

  it('should be a function', function() {
    expect(validator).to.be.a('function');
  });

  const invalidValues = {
    'an empty string': '',
    'spaces': '  ',
    'whitespace': '\t\n  \t '
  };

  _.each(invalidValues, (invalidValue, description) => {
    it(`should add an error when validating ${description}`, function() {
      const context = validate(invalidValue);
      expectNotBlankError(context, { message: 'must not be blank' });
    });
  });

  const validValues = {
    'a string': 'foo bar',
    'a string with leading whitespace': '  foo',
    'a string with trailing whitespace': 'bar  ',
    'a string with leading and trailing whitespace': '\tfoo bar\n'
  };

  _.each(validValues, (validValue, description) => {
    it(`should not add any error when validating ${description}`, function() {
      const context = validate(validValue);
      expectNoError(context);
    });
  });

  function validate(value) {
    const context = mockContext({ value: value });
    validator(context);
    return context;
  }
});
