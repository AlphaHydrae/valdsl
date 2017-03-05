const _ = require('lodash');
const MessageFormat = require('messageformat');

const mf = new MessageFormat('en');
const defaultMessage = mf.compile('does not match the expected format{FORMAT, select, undefined{} other{: {FORMAT}}}');

export default function format(regexp, formatDescription) {
  return function(context) {
    var value = context.get('value');
    if (!_.isString(value) || !value.match(regexp)) {
      context.addError({
        validator: 'format',
        message: defaultMessage,
        messageParameters: {
          FORMAT: formatDescription
        }
      });
    }
  };
}
