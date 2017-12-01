import _ from 'lodash';
import MessageFormat from 'messageformat';

const mf = {};
const defaultLang = 'en';

export function dynamicMessage(message, lang) {
  return getMessageFormat(lang || defaultLang).compile(message);
}

export function resolve(value, ...args) {
  return Promise.resolve(_.isFunction(value) ? value.apply(undefined, args) : value);
}

export function toNativePromise(promise) {
  return new Promise((resolve, reject) => promise.then(resolve, reject));
}

function getMessageFormat(lang) {
  if (!mf[lang]) {
    mf[lang] = new MessageFormat(lang);
  }

  return mf[lang];
}
