/**
* AnnouncementGroup.js
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
        path: {
            type: 'string'
        },
        image: {
            type: 'json'
        },
        description: {
            type: 'string',
        },
        details: {
            type: 'string',
        },
        location: {
            type: 'json'
        },
        features: {
            type: 'json'
        },
        tags: {
            type: 'string'
        },
        toJSON: function () {
            var obj = this.toObject();
            return obj;
        }

	}

    
    
};

