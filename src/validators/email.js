import _ from 'lodash';
import valib from 'valib';

const defaultMessage = 'must be a valid e-mail address';

export default function email() {
  return function(context) {
    const value = context.get('value');
    if (!_.isString(value) || !valib.String.isEmailLike(value)) {
      context.addError({
        validator: 'email',
        message: defaultMessage
      });
    }
  };
}
