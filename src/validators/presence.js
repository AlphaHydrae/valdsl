import _ from 'lodash';

// TODO: add separate required validator
const defaultMissingMessage = 'is required';
const defaultEmptyMessage = 'must not be empty';

export default function presence() {
  return function(context) {

    const value = context.get('value');

    let cause, message;
    if (isEmpty(value)) {
      cause = 'empty';
      message = defaultEmptyMessage;
    } else if (!value) {
      cause = 'missing';
      message = defaultMissingMessage;
    }

    if (message) {
      context.addError({
        validator: 'presence',
        cause: cause,
        message: message
      });
    }
  };
}

function isEmpty(value) {
  if (_.isString(value) || _.isArray(value)) {
    return !value.length;
  } else if (_.isObjectLike(value)) {
    return !_.keys(value).length;
  } else {
    return false;
  }
}
