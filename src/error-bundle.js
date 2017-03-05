import ExtendableError from 'es6-error';

class ValidationErrorBundle extends ExtendableError {
  constructor(message, errors) {
    super(message || 'A validation error occurred');
    this.errors = errors;
  }
}

export default ValidationErrorBundle;
