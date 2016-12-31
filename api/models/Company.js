/**
 * CompanyInfo
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    attributes: {
        assetType: {
            type: 'string'
        },
        name: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        tags: {
            type: 'string'
        },
        backgroundImagePortrait: {
            type: 'json'
        },
        backgroundImageLandscape: {
            type: 'json'
        },
        logo: {
            type: 'json'
        },
        companyTitle: {
            type: 'string'
        },
        companyInfo: {
            type: 'string'
        },
        companyImage: {
            type: 'json'
        },
        mainTitle: {
            type: 'string'
        },
        mainInfo: {
            type: 'string'
        },
        mainImage: {
            type: 'json'
        },
        phone: {
            type: 'string'
        },
        web: {
            type: 'string'
        },
        email: {
            type: 'string'
        },
        hours: {
            type: 'string'
        },
        address: {
            type: 'string'
        },
        address1: {
            type: 'string'
        },
        network: {
            type: 'string'
        },
        toJSON: function () {
            var obj = this.toObject();
            return obj;
        }


    }
};
