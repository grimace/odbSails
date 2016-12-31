/**
 * Asset.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {

      name: {
        type: 'string',
        required: true
      },
      assetType: {
          type: 'string'
      },
      description: {
          type: 'string'
      },
      path: {
        type: 'string'
      },
      mimetype: {
        type: 'string'
      },
      width: {
        type: 'integer'
      },
      width: {
        type: 'integer'
      },
      size: {
        type: 'integer'
      },
      duration: {
        type: 'float'  
      },
      created: {
        type: 'date'
      },
      modified: {
        type: 'long'  
      },
      network: {
        type: 'string',
      },
      dimension: {
        type: 'json',
      },
      toJSON: function () {
          var obj = this.toObject();
          obj.created = dateutil.moment(obj.created).format('MM/DD/YYYY');

//          obj.validStartDate = dateutil.moment(obj.validStartDate).format('MM/DD/YYYY');
//          obj.validEndDate = dateutil.moment(obj.validEndDate).format('MM/DD/YYYY');
//          obj.presentationStartDate = dateutil.moment(obj.presentationStartDate).format('MM/DD/YYYY');
//          obj.presentationEndDate = dateutil.moment(obj.presentationEndDate).format('MM/DD/YYYY');
          return obj;
      }

	}

};
