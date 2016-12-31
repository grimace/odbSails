/**
 * Campaign
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    attributes: {
        title: {
            type: 'string',
            required: true
        },
        description: {
            type: 'string'
        },
        startDate: {
            type: 'date',
            required: true
        },
        endDate: {
            type: 'date',
            required: true
        },
        // This should be done with association
        // contains { id: '', title:'' }
        purchaseOrder: { // shouldn't this be something else, not so concrete? 
            type: 'json'
        },
        offers: {
            type: 'array'
        },
        
        // Array of IDs
        // we can try to use associations for this later.
        products: {
            type: 'array'
        },
        coupons: {
            type: 'array'
        },
        ads: {
            type: 'array'
        },
        distributions: {
            type: 'array'
        },
        // How are rules to be defined?
        // { days: [M,T,W,Th,F,S,Su], hours: [,,], gender: '' }
        rule: {
            type: 'json',
            required: true
        },

        // action: {
        //    type: '', [ activated | deactivated ]
        //    date: '',
        //    by: '',
        action: {
            type : 'json'
        },

        // instance methods
        couponCount: function() {
            if (this.coupons) {
                return this.coupons.length;
            }
            return 0;
        },
        adCount: function() {
            if (this.ads) {
                return this.ads.length;
            }
            return 0;
        },
        productCount: function() {
            if (this.products) {
                return this.products.length;
            }
            return 0;
        },
        isActive: function() {
            if (this.action) return (this.action.type == 'activated');
            return false;
        }

    }
};
