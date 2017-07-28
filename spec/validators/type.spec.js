import _ from 'lodash';
import { expect } from 'chai';
import typeFactory from '../../src/validators/type';
import { expectErrorFactory, expectNoError, mockContext } from '../helper';

require('../helper');

const expectTypeError = expectErrorFactory({ validator: 'type' });

describe('type validator', function() {

  let validator;

  it('should be a function', function() {
    validator = typeFactory('string');
    expect(validator).to.be.a('function');
  });

  const invalid = [
    {
      types: [ 'string' ],
      values: [ 0, 1, 2.3, { foo: 'bar' }, [ 4, 'foo' ], true, false, null, undefined ]
    },
    {
      types: [ 'number' ],
      values: [ '  ', 'foo', { foo: 'bar' }, [ 4, 'foo' ], true, false, null, undefined ]
    },
    {
      types: [ 'object' ],
      values: [ '  ', 'foo', 0, 1, 2.3, [ 4, 'foo' ], true, false, null, undefined ]
    },
    {
      types: [ 'array' ],
      values: [ '  ', 'foo', 0, 1, 2.3, { foo: 'bar' }, true, false, null, undefined ]
    },
    {
      types: [ 'boolean' ],
      values: [ '  ', 'foo', 0, 1, 2.3, { foo: 'bar' }, [ 4, 'foo' ], null, undefined ]
    }
  ];

  _.each(invalid, data => {
    _.each(data.values, invalidValue => {
      it(`should add an error when validating ${JSON.stringify(invalidValue)} with types ${data.types.join(', ')}`, function() {
        validator = typeFactory(...data.types);

        const context = validate(invalidValue);
        expectTypeError(context, {
          message: `must be of type ${data.types.join(', ')}`,
          types: data.types
        });
      });
    });
  });

  const valid = [
    {
      types: [ 'string' ],
      values: {
        'an empty string': '',
        'a blank string': '  ',
        'a string': 'foo bar'
      }
    },
    {
      types: [ 'number' ],
      values: {
        'a number': 2.4,
        'an integer': 42,
        'a negative number': -3
      }
    },
    {
      types: [ 'object' ],
      values: {
        'an object': { foo: 'bar' }
      }
    },
    {
      types: [ 'array' ],
      values: {
        'an array': [ 4, 'foo' ]
      }
    },
    {
      types: [ 'boolean' ],
      values: {
        'true': true,
        'false': false
      }
    }
  ];

  _.each(valid, data => {
    _.each(data.values, (validValue, description) => {
      it(`should not add any error when validating ${description} with types ${data.types.join(', ')}`, function() {
        validator = typeFactory(...data.types);
        const context = validate(validValue);
        expectNoError(context);
      });
    });
  });

  function validate(value) {
    const context = mockContext({ value: value });
    validator(context);
    return context;
  }
});
