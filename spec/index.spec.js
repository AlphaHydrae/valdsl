var _ = require('lodash'),
    chai = require('chai'),
    expect = chai.expect,
    Promise = require('bluebird'),
    valdsl = require('../');

describe('valdsl', function() {

  var validate;
  beforeEach(function() {
    validate = valdsl();
  });

  it('should find errors in an HTTP request', function(done) {

    var request = fakeHttpRequest({
      body: {
        email: 'foo',
        password: 'letmein',
        role: 'god',
        cityId: 24
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

      _.each(err.errors, function(error) {
        error.location = error.location.toString();
      });

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
        message: 'Value must be a string at least 8 characters long. The supplied string is too short (7 characters long).',
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

  it('should help transform request data', function() {

    var request = fakeHttpRequest({
      body: {
        street: 'Maple Street',
        cityId: 42
      }
    });

    var city = {
      id: 42,
      name: 'Hill Valley',
      population: 327103
    };

    function findCity(id) {
      return Promise.delay(5).return(city);
    }

    return validate(function() {

      // Validate an HTTP request.
      return this.validate(this.value(request), function() {
        return this.parallel(

          // Validate the JSON request body.
          this.validate(this.get('body'), function() {
            return this.parallel(
              // Validate each property.
              this.validate(this.json('/street'), this.presence(), this.stringLength(1, 50)),
              this.validate(this.json('/cityId'), this.presence(), this.resource(findCity).moveTo('/city'))
            );
          })
        );
      });
    }).then(function() {
      expect(request.body.street).to.equal('Maple Street');
      expect(request.body.city).to.equal(city);
      expect(request.body).to.have.all.keys('street', 'city');
    });
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
