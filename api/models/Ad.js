/**
 * Ad.js
 *
 * @description :: Represents an ad associated with a product that can be delivered to a kiosk, mobile device, or anything with a screen
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
        name : {
          type: 'string',
		  required: true
        },
        zone : {
            type : 'string',
            enum: ['windowed', 'sandbox', 'full', 'insertion'],
		    required: true
        },
        // JSON containing rules
        target: {
            type: 'json'
        },
        // contains bucket/key information
        // { key:'', bucket:'', mimetype:'', size:'' }
        path: {
            type: 'json'
        }
    },

    // Lifecycle callback
    beforeCreate:function(values, cb){
        return cb();
	}

};
