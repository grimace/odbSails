/**
* PurchaseOrder.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

    attributes: {
        title: {
            type: 'string',
            required: true
        },
        amount: {
            type: 'float',
            required: true
        },
        descrption: {
            type: 'string'
        },
        // This equates to Region/Market
        targetMarket: {
            type: 'string',
            required: true
        },
        retailer: {
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
        budget: {
            type: 'json',
            required: true
        },
        // This should be done with association
        // contains { id: '', title:'' }
        campaign: {
            type: 'json'
        },
        // Embeded document
        // action: {
        //    type: '', [ approved | declined ]
        //    date: '',
        //    by: '',
        //    comment: '',
        // }
        action: {
            type : 'json'
        },

        // instance methods
        approved: function() {
            if (this.action) return (this.action.type == 'approved');
            return false;
        },
        declined: function() {
            if (this.action) return (this.action.type == 'declined');
            return false;
        }

    }
};
