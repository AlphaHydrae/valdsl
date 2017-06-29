const defaultMessage = 'must not be empty';

export default function notEmpty() {
  return function(context) {
    const value = context.get('value');
    if (value.length === 0) {
      context.addError({
        validator: 'notEmpty',
        message: defaultMessage
      });
    }
  };
}
