/**
* Display.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {

        name: {
            type: 'string',
			required: true
        },
        description: {
            type: 'string',
        },
        displays: {
            type: 'json'
        },
        tags: {
            type: 'string'
        },
        defaultLayout: {
            type: 'string'
        },
        defaultLayoutType: {
            type: 'string'
        },
        toJSON: function () {
            var obj = this.toObject();
            return obj;
        }

	}
};

