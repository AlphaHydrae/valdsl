import ExtendableError from 'es6-error';

class ValidationError extends ExtendableError {
  constructor(message) {
    super(message);
  }
}

export default ValidationError;
