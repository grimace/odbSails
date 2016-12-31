/**
 * Feed.js
 *
 * @description :: Feeds are content references for new, weather, etc. feeds
 *
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
		url: {
			type: 'string',
            required: true
		},
        // list of parameters for the feed
        parameters: {
            type: 'json'
        },
        toJSON: function () {
            var obj = this.toObject();
            return obj;
        }
	}

};
