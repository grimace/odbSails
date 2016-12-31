/**
 *  NetworkAlert. Uses the same collection As AlertHistory & CloudAlert Model.
 *   Holds information arount Kombi network outages.
 *   See AlertHistory for other types.
 *
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  tableName: 'ops',
  attributes: {
      // Player or Network
      type: {
          type: 'string'
      },
      name: {
          type: 'string'
      },
      reason: {
          type: 'string'
      },
      terminalId: {
          type: 'string'
      },
      macAddress: {
          type: 'string'
      },
      // Date of the event
      date: {
          type: 'date'
      },
      // How long did the event last
      time: {
          type: 'integer'
      },
      // When was this event logged
      created: {
          type: 'date'
      }
  },
  // This is a read only model, throw an error if they try to save a new object
  beforeValidate: function(values, next) {
    return next(new Error('This is ReadOnly Model!'));
  }

};
