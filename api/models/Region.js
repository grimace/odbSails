/**
 * Region.js
 *
 * @description :: TODO: The Layout Model which is used to display a screen on the DSN
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {

        name: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        top: {
            type: 'integer',
        },
        left: {
            type: 'integer',
        },
        width: {
            type: 'integer',
        },
        height: {
            type: 'integer',
        },
        entries: {
            type: 'json'
            
        },
        options: {
            type: 'json'
        },
        tags: {
            type: 'json'
        },
        toJSON: function () {
            var obj = this.toObject();
            return obj;
        }

	}

};
