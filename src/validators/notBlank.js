import _ from 'lodash';

const defaultMessage = 'must not be blank';

export default function notBlank() {
  return function(context) {
    const value = context.get('value');
    if (_.isString(value) && value.match(/^\s+$/)) {
      context.addError({
        validator: 'notBlank',
        message: defaultMessage
      });
    }
  };
}
