const defaultMessage = 'is required';

export default function required() {
  return function(context) {
    const value = context.get('value');
    if (value === undefined || value === null) {
      context.addError({
        validator: 'required',
        message: defaultMessage
      });
    }
  };
}
