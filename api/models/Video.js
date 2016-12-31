var baseModel  = require('./Asset'),
  _          = require('lodash');

module.exports = _.merge({}, baseModel, {

//User model implmentation
  attributes: {
    path: {
      type: 'string',
      required: true
    },
    duration: {
      type: 'float'
    }
  }

});
