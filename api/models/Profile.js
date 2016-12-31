/**
 * Profile.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        age: {
          type: 'integer'
        },
        gender: {
          type: 'string',
          enum: ['Male', 'Female']
        },
        haircolor: {
          type: 'string',
          enum: ['Black', 'Blonde', 'Brown', 'Red', 'Blue', 'Green', 'Bold', 'Other']
        }
    }
};

