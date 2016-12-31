/**
 * Layout.js
 *
 * @description :: TODO: The Layout Model which is used to display a screen on the DSN
 * @docs		:: http://sailsjs.org/#!documentation/models
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
        width: {
            type: 'string',
        },
        height: {
            type: 'string',
        },
        template: {
            type: 'string',
        },
        duration: {
            type: 'float'  
        },
        backgroundPortraitImage: {
            type: 'json'
        },
        backgroundLandscapeImage: {
            type: 'json'
        },
        regions: {
            type: 'json'
        },
        network: {
            type: 'string',
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
