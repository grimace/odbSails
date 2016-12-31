/**
* AlertHistory. Uses the same collection as CloudAlert Model.
*   Alert History used to display data around Kiosks and Toppers.
*   See CloudAlert for other types.
*   
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  
  tableName: 'ops',
  attributes: {
    
        type: {
            type: 'string',
            required: true,
            defaultsTo: 'checkin'
        },
        terminalId: {
            type: 'string'           
        },
        macAddress: {
            type: 'string'           
        },
        port: {
            type: 'integer'
        },
        serialNumber: {
            type: 'string'           
        },
        lastCheckIn: {
            type: 'date'           
        },
        timeDiff: {
            type: 'integer'
        },
        threshold: {
            type: 'integer'
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
