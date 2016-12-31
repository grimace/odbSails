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
        layouts: {
            type: 'json'
        },
        tags: {
            type: 'string'
        },
        network: {
            type: 'string',
        },
        toJSON: function () {
            var obj = this.toObject();
            return obj;
        }

	}

};
