import chai from 'chai';
import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

chai.config.includeStack = true;

export function expectNoError(context) {
  expect(context.addError.args).to.eql([]);
}

export function expectErrorFactory(commonProperties) {
  return function expectCustomError(context, error) {
    expect(context.addError.called).to.equal(true, 'expected an error to have been added');
    expect(context.addError.args).to.eql([ [ _.extend({}, commonProperties, error) ] ]);
    expect(context.addError.thisValues[0]).to.equal(context);
  };
}

export function mockContext(state) {
  const context = {};
  context.addError = sinon.spy();
  context.get = _.get.bind(_, state);
  return context;
}

chai.use(function(_chai, utils) {
  utils.addChainableMethod(chai.Assertion.prototype, 'haveErrors', function(...expectedErrors) {

    const obj = utils.flag(this, 'object');

    let actualErrors = obj.errors;
    new chai.Assertion(actualErrors).to.be.an('array');

    actualErrors = actualErrors.map(serializeError);

    expectedErrors = _.flatten(expectedErrors);
    const missingErrors = expectedErrors.slice();
    const extraErrors = actualErrors.slice();

    _.each(expectedErrors, expectedError => {
      const matchingError = _.find(extraErrors, error => _.isEqual(error, expectedError));
      if (matchingError) {
        extraErrors.splice(extraErrors.indexOf(matchingError), 1);
        missingErrors.splice(missingErrors.indexOf(expectedError), 1);
      }
    });

    var messages = [];
    if (missingErrors.length) {
      messages.push(`The following errors were not found:\n${describeErrors(missingErrors)}`);
    }
    if (extraErrors.length) {
      messages.push(`The following extra errors were found:\n${describeErrors(extraErrors)}`);
    }

    new chai.Assertion(obj.errors).assert(
      _.isEmpty(messages),
      `Expected specific errors.\n\n${messages.join('\n\n')}`,
      `Expected different errors.\n\n${messages.join('\n\n')}`
    );
  });
});

function describeErrors(errors) {
  return errors.map(error => JSON.stringify(error)).join('\n');
}

function serializeError(error) {
  return _.reduce(error, function(memo, value, key) {
    memo[key] = value;
    return memo;
  }, {});
}
