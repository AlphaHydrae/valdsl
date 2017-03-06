import _ from 'lodash';
import email from '../validators/email';
import format from '../validators/format';
import inclusion from '../validators/inclusion';
import required from '../validators/required';
import resource from '../validators/resource';
import string from '../validators/string';
import type from '../validators/type';

export default function defaultValidatorsPlugin() {
  return function(valdsl) {
    valdsl.dsl.extend({
      email: email,
      format: format,
      inclusion: inclusion,
      required: required,
      resource: resource,
      string: string,
      type: type
    });
  };
}
