/**
* Budget.js
*
* @description :: represents a give budget. Budgets have a total and
*                 assigned PO that reference them and should total to
*                 the budget total. Budgets need to be approved before
*                 a PO can reference them.
*                 Ultimately Budgets will belong to a given network.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
        title: {
            type: 'string',
            required: true
        },
        brand: {
            type: 'string',
            required: true
        },
        client: {
            type: 'string',
            required: true
        },
        amount: {
            type: 'float',
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
