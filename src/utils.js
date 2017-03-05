import _ from 'lodash';
import BPromise from 'bluebird';
import MessageFormat from 'messageformat';

const mf = {};
const defaultLang = 'en';

export function dynamicMessage(message, lang) {
  return getMessageFormat(lang || defaultLang).compile(message);
}

export function resolve(value, ...args) {
  return BPromise.resolve(_.isFunction(value) ? value.apply(undefined, args) : value);
}

function getMessageFormat(lang) {
  if (!mf[lang]) {
    mf[lang] = new MessageFormat(lang);
  }

  return mf[lang];
}
