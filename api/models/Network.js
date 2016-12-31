/**
 * Network.js
 *
 * @description :: TODO: The Network Model which is used to display a screen on the DSN
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
        tags: {
            type: 'string'
        },
        toJSON: function () {
            var obj = this.toObject();
            return obj;
        }

	}

};
