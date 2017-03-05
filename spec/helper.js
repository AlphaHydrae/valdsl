const _ = require('lodash');
const chai = require('chai');

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
