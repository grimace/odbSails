/**
* Kiosk.js
*
* @description :: Model, can be used to retreive POI/Kiosks.
*                 Note, you must specify a DISCRIMINATOR value of 'ATM' if doing custom find
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

    tableName: 'poi',
    adapter: 'neocard',

    attributes: {
        DISCRIMINATOR: {
            type: 'string',
            enum: ['ATM']
        },
        macAddress: {
            type: 'string',
        },
        terminalId: {
            type: 'string',
        },
        tunnelPort: {
            type: 'integer',
        },
        lastCheckIn: {
            type: 'date'
        },
        merchant: {
            type: 'string'
        },
        // ie: { "coordinates" : [-122.521038,47.627844], "type" : "Point"}
        geometry: {
            type: 'json'
        },
        // ie: {"serialNumber" : "Kiosk.v1.00018","currentStatus" : "active","isProduction" : false	},
        service: {
            type: 'json'
        },
        address1: {
            type: 'string',
        },
        address2: {
            type: 'string',
        },
        city: {
            type: 'string',
        },
        state: {
            type: 'string',
        },
        zip: {
            type: 'string',
        },
        isProduction : function() {
            if (this.service.isProduction == true) {
                return true;
            } else {
                return false;
            }
        }
    },
    // Finds all active Kiosks
    findAll: function(callback, sortCriteria) {
        var sort = { terminalId : 'asc' };
        if (sortCriteria) {
            sort = sortCriteria;
        }
        this.find().where({ 'DISCRIMINATOR': 'ATM',
                            'service.currentStatus' : 'active'}).sort(sort).exec(function(err, kiosks) {
            if (err) callback(err);
            callback(null, kiosks);
        });
    },
    // Finds all Production only Kiosks
    findProduction: function(callback, sortCriteria) {
        var sort = { terminalId : 'asc' };
        if (sortCriteria) {
            sort = sortCriteria;
        }
        this.find().where({ 'DISCRIMINATOR': 'ATM',
                            'service.currentStatus' : 'active',
                            'service.isProduction' : true }).sort(sort).exec(function(err, kiosks) {
            if (err) callback(err);
            callback(null, kiosks);
        });
    },
    // Finds all Lab Kiosks
    findLab: function(callback, sortCriteria) {
        var sort = { terminalId : 'asc' };
        if (sortCriteria) {
            sort = sortCriteria;
        }
        this.find().where({ 'DISCRIMINATOR': 'ATM',
                            'service.currentStatus' : 'active',
                            'service.isProduction' : false }).sort(sort).exec(function(err, kiosks) {
            if (err) callback(err);
            callback(null, kiosks);
        });

    },

    // This model can only be updated, not created.
    beforeCreate: function(values, next) {
        return next(new Error('This is Read/Update only model!'));
    }

};

