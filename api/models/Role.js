/**
 * Defines Roles available to the system.
 * TODO : Implement ?????
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  tableName : 'role',
  attributes: {
  	role: {
        type:  'string',
        required:true,
        unique: true
    },
    access: {
        type: 'array'
    }
  }

};
