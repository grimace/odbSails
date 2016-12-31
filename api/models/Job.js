/**
* Job.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
    tableName: 'jobs',
    
    attributes: {
        DISCRIMINATOR: {
            type: 'string'
        },
        start: {
            type: 'date'
        },
        end: {
            type: 'date'
        },
        email: {
            type: 'string'
        },
        status: {
            type: 'string'
        },
        detail: {
            type: 'string'
        }
    }
};

