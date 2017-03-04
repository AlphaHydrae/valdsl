const _ = require('lodash');
const chai = require('chai');

chai.use(function(_chai, utils) {
  utils.addChainableMethod(chai.Assertion.prototype, 'haveErrors', function() {

    const obj = utils.flag(this, 'object');

    const actualErrors = obj.errors;
    new chai.Assertion(actualErrors).to.be.an('array');

    _.each(actualErrors, error => {
      error.location = error.location.toString();
    });

    const expectedErrors = _.flatten(_.toArray(arguments));
    const missingErrors = expectedErrors.slice();
    const extraErrors = actualErrors.slice();

    _.each(expectedErrors, expectedError => {
      const matchingError = _.find(actualErrors, error => _.isEqual(error, expectedError));
      if (matchingError) {
        extraErrors.splice(extraErrors.indexOf(matchingError), 1);
        missingErrors.splice(missingErrors.indexOf(matchingError), 1);
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
