import _ from 'lodash';
import { expect } from 'chai';
import presenceFactory from '../../src/validators/presence';
import { mockContext } from '../helper';

require('../helper');

describe('presence', function() {

  let presence;
  beforeEach(function() {
    presence = presenceFactory();
  });

  it('should be a function', function() {
    expect(presence).to.be.a('function');
  });

  const missingErrors = {
    'undefined': undefined,
    'null': null,
    'false': false,
    'zero': 0
  };

  _.each(missingErrors, (missingValue, description) => {
    it(`should add a missing error for ${description}`, function() {
      const context = mockContext({ value: missingValue });
      presence(context);
      expectPresenceError(context, { cause: 'missing', message: 'is required' });
    });
  });

  const emptyErrors = {
    'empty strings': '',
    'empty arrays': [],
    'empty objects': {}
  };

  _.each(emptyErrors, (emptyValue, description) => {
    it(`should add an empty error for ${description}`, function() {
      const context = mockContext({ value: emptyValue });
      presence(context);
      expectPresenceError(context, { cause: 'empty', message: 'must not be empty' });
    });
  });
});

function expectPresenceError(context, error) {
  expect(context.addError.calledOnce).to.equal(true);
  expect(context.addError.thisValues[0]).to.equal(context);
  expect(context.addError.args[0]).to.eql([ _.extend(error, { validator: 'presence' }) ]);
}
