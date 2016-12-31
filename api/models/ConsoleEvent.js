/**
* Logs events initiated through the console.
* 
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  
  // Model defaults to having CreatedAt and UpdatedAt
  autoCreatedAt: true,
  autoUpdatedAt: false,
  
  attributes: {
    
      type: {
          type: 'string',
          required: true,
          defaultsTo: 'operational'
      },
      event: {
          type: 'string'
      },
      // json object with supporting information
      // example:  { userEmail: 'xxx', ticketId: '' } in the case of a user request PIN reset.
      // or :  { port: '' } in the case of topper reboot
      message: {
          type: 'json'
      },
      userid: {
          type: 'string',
          required: true
      }
  },
  // These Models can only be created, not updated.
  beforeUpdate: function(values, next) {
    return next(new Error('This Model Cannot be Updated!'));
  }
  
};
