import ExtendableError from 'es6-error';

class ValidationError extends ExtendableError {
  constructor(message) {
    super(message);

    Object.defineProperty(this, 'message', {
      enumerable: true
    });
  }
}

export default ValidationError;
