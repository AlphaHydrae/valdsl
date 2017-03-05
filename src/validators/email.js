const defaultMessage = 'must be a valid e-mail address';

export default function email() {
  return function(context) {
    if (!_.isString(context.get('value')) || !valib.String.isEmailLike(context.get('value'))) {
      context.addError({
        validator: 'email',
        message: defaultMessage
      });
    }
  };
}
