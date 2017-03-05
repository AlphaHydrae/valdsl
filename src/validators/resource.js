import _ from 'lodash';
import BPromise from 'bluebird';
import { dynamicMessage } from '../utils';

const defaultMessage = dynamicMessage('{value} not found');

export default function resource(loader, options) {
  options = _.extend({}, options);

  const action = function(context) {
    return BPromise.resolve(loader(context.get('value'))).then(function(resource) {
      if (!resource) {
        return context.addError({
          validator: 'resource',
          message: defaultMessage
        });
      }

      if (options.replace && _.isFunction(context.get('location').setValue)) {
        context.get('location').setValue(_.isFunction(options.replace) ? options.replace(resource) : resource);
      }

      if (options.moveTo) {
        if (!context.has('location')) {
          throw new Error('Moving the value requires a location');
        } else if (!_.isFunction(context.get('location').move)) {
          throw new Error('Moving the value requires the location to provide a `move` function');
        }

        context.set('location', context.get('location').move(options.moveTo));
      }
    });
  };

  action.replace = function(by) {
    options.replace = by;
    return action;
  };

  action.moveTo = function(to) {
    options.moveTo = to;
    return action;
  };

  return action;
}
