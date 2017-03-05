import email from '../validators/email';
import format from '../validators/format';
import inclusion from '../validators/inclusion';
import presence from '../validators/presence';
import resource from '../validators/resource';
import stringLength from '../validators/string-length';
import type from '../validators/type';

export default {
  email: email,
  format: format,
  inclusion: inclusion,
  presence: presence,
  resource: resource,
  stringLength: stringLength,
  type: type
};
