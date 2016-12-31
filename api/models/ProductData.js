/**
 * ProductData.js
 *
 * @description :: Products define objects that belong to a given campaign.
 *                 They can be used to show assets/coupons to users
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
		image: {
			type: 'string'
		},
		thumb: {
			type: 'string'
		},
		featured: {
			type: 'boolean',
		},
        // list of features of type ProductFeature
		features: {
			type: 'json',
		},
		// Array of Strings ['CVS', 'Fresh And Easy', ... ]
		price: {
			type: 'string'
		},
		// comma separated list of category
		categories: {
			type: 'string'
		},
        toJSON: function () {
            var obj = this.toObject();
            return obj;
        }
        
	}

};