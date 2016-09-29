var chai = require('chai'),
    expect = chai.expect,
    valdsl = require('../'),
    ValidationError = valdsl.ValidationError;

describe('valdsl', function() {
  it('should validate an HTTP request', function(done) {

    var fakeHeaders = {
      Authorization: 'foo',
      Accept: 'application/json'
    };

    var fakeRequest = {
      body: {
        email: 'foo',
        password: 'letmein'
      },

      get: function(headerName) {
        return fakeHeaders[headerName];
      }
    };

    valdsl(function() {

      // Validate an HTTP request.
      return this.validate(this.value(fakeRequest), function() {
        return this.parallel(

          // Validate headers.
          this.validate(this.header('Pagination'), this.presence()),

          // Validate the JSON request body.
          this.validate(this.get('body'), function() {
            return this.validate(this.json('/name'), this.presence());
          })
        );
      });
    }).then(failOnSuccess).catch(function(err) {
      if (!(err instanceof ValidationError)) {
        throw err;
      }

      expect(err.errors).to.be.an('array');

      expect(err.errors).to.include({
        type: 'json',
        location: '/name',
        code: 'validation.presence.missing',
        message: 'Value is required.',
        value: undefined,
        valueSet: false
      });

      expect(err.errors).to.include({
        type: 'header',
        location: 'Pagination',
        code: 'validation.presence.missing',
        message: 'Value is required.',
        value: undefined,
        valueSet: false
      });

      expect(err.errors).to.have.lengthOf(2);

    }).then(done, done);
  });
});

function failOnSuccess() {
  throw new Error('Expected validation to fail but no errors were found');
}
