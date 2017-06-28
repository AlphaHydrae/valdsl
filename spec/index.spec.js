const _ = require('lodash');
const BPromise = require('bluebird');
const chai = require('chai');
const expect = chai.expect;
const valdslFactory = require('../lib');

require('./helper');

describe('valdsl', function() {

  var valdsl;
  beforeEach(function() {
    valdsl = valdslFactory();
  });

  it('should find errors in an HTTP request', function() {

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

    return valdsl(function() {

      // Validate an HTTP request.
      return this.validate(this.value(request), function() {
        return this.parallel(

          // Validate headers.
          this.validate(this.header('Authorization'), this.format(/^Bearer .+$/)),
          this.validate(this.header('Pagination-Offset'), this.required()),

          // Validate the JSON request body.
          this.validate(this.property('body'), function() {
            return this.parallel(
              // Validate each property.
              this.validate(this.json('/name'), this.required(), this.string(1, 50)),
              this.validate(this.json('/email'), this.email()),
              this.validate(this.json('/password'), this.required(), this.string(8)),
              this.validate(this.json('/role'), this.inclusion('user', 'admin')),
              this.validate(this.json('/cityId'), this.resource(_.noop))
            );
          })
        );
      });
    }).then(fail).catch(expectValidationErrors(
      {
        type: 'header',
        location: 'Authorization',
        validator: 'format',
        format: undefined,
        message: 'does not match the expected format',
        value: 'foo',
        valueSet: true
      },
      {
        type: 'header',
        location: 'Pagination-Offset',
        validator: 'required',
        message: 'is required',
        value: undefined,
        valueSet: false
      },
      {
        type: 'json',
        location: '/name',
        validator: 'required',
        message: 'is required',
        value: undefined,
        valueSet: false
      },
      {
        type: 'json',
        location: '/name',
        validator: 'string',
        validation: 'between',
        minLength: 1,
        maxLength: 50,
        actualLength: undefined,
        cause: 'wrongType',
        message: 'must be a string between 1 and 50 characters long (the supplied value is of the wrong type)',
        value: undefined,
        valueSet: false
      },
      {
        type: 'json',
        location: '/email',
        validator: 'email',
        message: 'must be a valid e-mail address',
        value: 'foo',
        valueSet: true
      },
      {
        type: 'json',
        location: '/password',
        validator: 'string',
        validation: 'atLeast',
        minLength: 8,
        maxLength: undefined,
        actualLength: 7,
        cause: 'tooShort',
        message: 'must be a string at least 8 characters long (the supplied string is too short: 7 characters long)',
        value: 'letmein',
        valueSet: true
      },
      {
        type: 'json',
        location: '/role',
        validator: 'inclusion',
        allowedValues: [ 'user', 'admin' ],
        allowedValuesDescription: 'user, admin',
        message: 'must be one of user, admin',
        value: 'god',
        valueSet: true
      },
      {
        type: 'json',
        location: '/cityId',
        validator: 'resource',
        message: '24 not found',
        value: 24,
        valueSet: true
      }
    ));
  });

  it('should validate conditionnally', function() {

    var user = {
      email: 'foo'
    };

    var newUser = {
      email: 'foo',
      password: 'letmein',
      role: 'god',
      cityId: 24
    };

    return valdsl(function() {

      // Validate an HTTP request.
      return this.validate(this.value(newUser), this.while(this.isSet()), this.while(this.changed()), this.until(this.error(this.atCurrentLocation())), function() {
        return this.parallel(
          // The name is not validated because it's not in the object and `this.while(this.set())` was specified
          this.validate(this.json('/name'), this.required(), this.string(1, 50)),
          // The e-mail is not validated because it hasn't changed compared to its previous value and `this.while(this.changed())` was specified
          this.validate(this.json('/email'), this.previous(user.email), this.required(), this.string(5)),
          // The password is not validated because the condition around it is not fulfilled
          this.validate(this.json('/password'), this.required(), this.if(false, this.string(8))),
          // Only the type validation is performed because the if/else condition is fulfilled
          this.validate(this.json('/role'), this.ifElse(true, this.type('number'), this.inclusion('user', 'admin'))),
          // No validation is performed after this.break()
          this.validate(this.json('/cityId'), this.break(), this.type('string'))
        );
      });
    }).then(fail).catch(expectValidationErrors(
      {
        validator: 'type',
        typeDescription: 'number',
        message: 'must be of type number',
        value: 'god',
        valueSet: true,
        type: 'json',
        location: '/role'
      }
    ));
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
      return BPromise.delay(5).return(city);
    }

    return valdsl(function() {

      // Validate an HTTP request.
      return this.validate(this.value(request), function() {
        return this.parallel(

          // Validate the JSON request body.
          this.validate(this.property('body'), function() {
            return this.parallel(
              // Validate each property.
              this.validate(this.json('/street'), this.required(), this.string(1, 50)),
              this.validate(this.json('/cityId'), this.required(), this.resource(findCity).replace(true).moveTo('/city'))
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

  function expectValidationErrors(...errors) {
    return function(err) {

      if (!(err instanceof valdsl.ValidationErrorBundle)) {
        throw err;
      }

      expect(err).to.haveErrors(errors);
    };
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
});

function fail() {
  throw new Error('Expected validation to fail but no errors were found');
}
