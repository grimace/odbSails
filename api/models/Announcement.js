/**
 * Announcement.js
 *
 * @description :: Announcement has some stuff
 *
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
        types: {
            decimal2: function(number){
              return ((number *100)%1 === 0);
            }
        },
        name: {
            type: 'string',
            required: true
        },
        category: {
            type: 'string'
        },
		description: {
			type: 'string',
		},
        tags: {
            type: 'string'
        },
		image: {
			type: 'json'
		},
        featured: {
            type: 'boolean'
        },
        price: {
            type: 'decimal',
            decimal2: true
        },
        features: {
            type: 'json'
        },
        icon: {
            type: 'json'
        },
        scanCode: {
            type: 'json'
        },
        tags: {
            type: 'string'
        },
        network: {
            type: 'string',
            required: true
        },
        toJSON: function () {
            var obj = this.toObject();
            return obj;
        }
	}

};
