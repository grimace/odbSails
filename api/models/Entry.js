/**
 * Entry.js
 *
 * @description :: TODO: The Layout Model which is used to display a screen on the DSN
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {

        mediaid: {
            type: 'string',
        },
        duration: {
            type: 'string',
        },
        mimetype: {
            type: 'string',
        },
        duration: {
            type: 'integer',
        },
        options: {
            type: 'json'
        },
        raw: {
            type: 'json'
        },
        tags: {
            type: 'json'
        },
        owner:{
            model:'region'
        },
        toJSON: function () {
            var obj = this.toObject();
            return obj;
        }

	}

};
