/**
 * Product.js
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
//            required: true
        },
		description: {
			type: 'string',
		},
        tags: {
            type: 'string'
        },
        productDetail: {
            type: 'string'
        },
		brand: {
			type: 'string',
//            required: true
		},
        showLocation: {
            type: 'boolean',
            defaultsTo : false
        },
        location: {
            type: 'json'
        },
        image: {
            type: 'json'
        },
		// Array of Strings ['CVS', 'Fresh And Easy', ... ]
		marketAvailability: {
			type: 'array',
//            required: true
		},
		// Array of IDs
		// we can try to use associations for this later.
//		coupons: {
//			type: 'array'
//		},
		// Array of IDs
		// we can try to use associations for this later.
//		ads: {
//			type: 'array'
//		},
        // list of items of type ProductData
        items: {
            type: 'json'
        },
        toJSON: function () {
            var obj = this.toObject();
            return obj;
        }
	}

};
