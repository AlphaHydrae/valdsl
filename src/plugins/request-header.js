import _ from 'lodash';

export default function requestHeaderPlugin(options) {
  options = _.extend({}, options);
  if (_.has(options, 'get') && !_.isFunction(options.get)) {
    throw new Error('Get option must be a function');
  } else if (_.has(options, 'has') && !_.isFunction(options.has)) {
    throw new Error('Has option must be a function');
  }

  let getHeader = options.get;
  if (!getHeader) {
    getHeader = (req, header) => req.get(header);
  }

  let hasHeader = options.has;
  if (!hasHeader) {
    hasHeader = (req, header) => req.get(header) !== undefined;
  }

  return function(valdsl) {
    valdsl.dsl.extend('header', navigateToRequestHeaderFactory(getHeader, hasHeader));
  };
}

function navigateToRequestHeaderFactory(getHeader, hasHeader) {
  return function(headerName) {
    return function(context) {

      const request = context.get('value');

      context.set({
        type: 'header',
        location: headerName,
        value: getHeader(request, headerName),
        valueSet: hasHeader(request, headerName)
      });
    };
  };
}
