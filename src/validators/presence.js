const defaultMessage = 'is required';

export default function presence() {
  return function(context) {
    if (!context.get('value')) {
      context.addError({
        validator: 'presence',
        message: defaultMessage
      });
    }
  };
}
