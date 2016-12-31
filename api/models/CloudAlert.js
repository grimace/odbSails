/**
* CloudAlert. Uses the same collection As AlertHistory Model.
*   Cloud Alert used to display data around CloudWatch alerts
*   See AlertHistory for other types.
*
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  
  tableName: 'ops',
  
  attributes: {
    
      type: {
          type: 'string',
          required: true,
          defaultsTo: 'cloudwatch'
      },
      name: {
          type: 'string'
      },
      reason: {
          type: 'string'
      },
      region: {
          type: 'string'
      },
      event: {
          type: 'string'
      },
      created: {
          type: 'date'
      }
  },
  // This is a read only model, throw an error if they try to save a new object
  beforeValidate: function(values, next) {
    return next(new Error('This is ReadOnly Model!'));
  }
  
};
