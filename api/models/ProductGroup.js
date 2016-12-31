/**
* ProductGroup.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {

        type: {
            type: 'json'
        },
        class: {
            type: 'json'
        },
        category: {
            type: 'json'
        },
        name: {
            type: 'string',
			required: true
        },
        path: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        details: {
            type: 'string',
        },
        tags: {
            type: 'string'
        },
        location: {
            type: 'json'
        },
        items: {
            type: 'json'
        },
        toJSON: function () {
            var obj = this.toObject();
            return obj;
        }

	}
};

