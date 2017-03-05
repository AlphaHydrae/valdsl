import _ from 'lodash';
import { dynamicMessage } from '../utils';

const defaultMessage = dynamicMessage('does not match the expected format{format, select, undefined{} other{: {format}}}');

export default function format(regexp, formatDescription) {
  return function(context) {
    const value = context.get('value');
    if (!_.isString(value) || !value.match(regexp)) {
      context.addError({
        validator: 'format',
        format: formatDescription,
        message: defaultMessage
      });
    }
  };
}
