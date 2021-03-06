/**
 * Coupon.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
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
			required: true
        },
        // region defintions that have top,left, width, height, mediaList
        regions: {
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
