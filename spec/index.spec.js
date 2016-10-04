var _ = require('lodash'),
    chai = require('chai'),
    expect = chai.expect,
    valdsl = require('../');

describe('valdsl', function() {

  var validate;
  beforeEach(function() {
    validate = valdsl();
  });

  it('should validate an HTTP request', function(done) {

    var request = fakeHttpRequest({
      body: {
        email: 'foo',
        password: 'letmein',
        role: 'god'
      },

      headers: {
        Authorization: 'foo',
        Accept: 'application/json'
      }
    });

    validate(function() {

      // Validate an HTTP request.
      return this.validate(this.value(request), function() {
        return this.parallel(

          // Validate headers.
          this.validate(this.header('Authorization'), this.format(/^Bearer .+$/)),
          this.validate(this.header('Pagination-Offset'), this.presence()),

          // Validate the JSON request body.
          // If a validation fails for a property, do not perform other validations for that property.
          this.validate(this.get('body'), this.unlessError(this.atCurrentLocation()), function() {
            return this.parallel(
              // Validate each property.
              this.validate(this.json('/name'), this.presence(), this.stringLength(1, 50)),
              this.validate(this.json('/password'), this.presence(), this.stringLength(8)),
              this.validate(this.json('/role'), this.inclusion('user', 'admin'))
            );
          })
        );
      });
    }).then(failOnSuccess).catch(function(err) {
      if (!(err instanceof validate.ValidationError)) {
        throw err;
      }

      expect(err.errors).to.be.an('array');

      expect(err.errors).to.include({
        type: 'header',
        location: 'Authorization',
        code: 'validation.format.invalid',
        message: 'Value does not match the expected format.',
        value: 'foo',
        valueSet: true
      });

      expect(err.errors).to.include({
        type: 'header',
        location: 'Pagination-Offset',
        code: 'validation.presence.missing',
        message: 'Value is required.',
        value: undefined,
        valueSet: false
      });

      expect(err.errors).to.include({
        type: 'json',
        location: '/name',
        code: 'validation.presence.missing',
        message: 'Value is required.',
        value: undefined,
        valueSet: false
      });

      expect(err.errors).to.include({
        type: 'json',
        location: '/password',
        code: 'validation.stringLength.tooShort',
        message: 'Value must be a string at least 8 characters long. The supplied string is 7 characters long.',
        value: 'letmein',
        valueSet: true
      });

      expect(err.errors).to.include({
        type: 'json',
        location: '/role',
        code: 'validation.inclusion.notIncluded',
        message: 'Value must be one of user, admin.',
        value: 'god',
        valueSet: true
      });

      expect(err.errors).to.have.lengthOf(5);

    }).then(done, done);
  });
});

function failOnSuccess() {
  throw new Error('Expected validation to fail but no errors were found');
}

function fakeHttpRequest(options) {
  options = _.extend({}, options);

  var headers = options.headers || {};

  return {
    body: options.body || {},

    get: function(header) {
      return headers[header];
    }
  };
}
