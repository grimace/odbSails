/**
 * CouponController
 *
 * @description :: Server-side logic for managing Contents
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var locals = require('../../config/local');
var base_directory = locals.s3BaseDirectory +'/content/';
var SkipperS3 = require('skipper-s3')({ key: locals.s3AccessKey,
  secret: locals.s3SecretKey,
  bucket: locals.s3DefaultBucket,
  dirname: base_directory});
module.exports = {

  find: function(req, res) {
    var cid = req.param('cid');
    Content.findOne({id:cid}).exec(function(err, content) {
      if (err) { sails.log.warn(err); }
      sails.log.debug("Found " + content.title);
      res.json( content );
    });

  },
  list: function(req, res) {
    // do we filter by product???
    var pid = req.param('');

    Content.find().exec(function(err, contents) {
      if (err) { sails.log.warn(err); }
      sails.log.debug("Found " + contents.length + " Content.");
      res.json( contents );
    });

  },

  upload: function(req, res) {
    var data = buildModel(req);

    async.parallel({
      one: function(callback) {
        var receiving = SkipperS3.receive();
        req.file('cFile').upload(receiving, function onUploadComplete (err, uploadedFiles) {
          if (err) return res.serverError(err);

          var file = uploadedFiles[0];
          if (file == null || file == undefined) {
            sails.log.error("File information was not returned");
          }
          var path = { key : file.extra.Key, bucket: file.extra.Bucket, size: file.size, mimetype: file.type};
          callback(null, path);
        });
      },
      two: function(callback) {
        var receiving = SkipperS3.receive();
        req.file('pFile').upload(receiving, function onUploadComplete (err, uploadedFiles) {
          if (err) return res.serverError(err);

          //sails.log.debug(JSON.stringify(uploadedFiles));
          var file = uploadedFiles[0];
          if (file == null || file == undefined) {
            sails.log.error("File information was not returned");
          }
          var path = { key : file.extra.Key, bucket: file.extra.Bucket, size: file.size, mimetype: file.type};
          callback(null, path);

        });
      }
    }, function (err, results) {
      // these are for Coupons/Offers
      data.codePath = results.one;
      data.productPath = results.two;
      // Get File data from both calls and save new file
      Content.create( data ).exec(function(err, c) {
        // Error handling
        if (err) return res.send(err,500);
        res.redirect('/campaign/library');
      });
    });
  },
  update: function( req, res ) {
    var cid = req.param('cid');
    var data = buildModel(req);
    async.parallel({
      one: function(callback) {
        // This is sloppy - we depend on the failure of the upload to see if the user is trying to replace a file
        var receiving = SkipperS3.receive();
        req.file('cFile').upload(receiving, function onUploadComplete (err, uploadedFiles) {
          sails.log.info("Update coupon code image replacing existing file");
          if ( err ) return res.serverError( err );

          var file = uploadedFiles[0];
          if ( !file ) {
            sails.log.info( "No Content File to update" );
            callback(null, null);
          } else {
            // add the new file information before saving
            var path = { key: file.extra.Key, bucket: file.extra.Bucket, mimetype:file.type, size:file.size};
            sails.log.info( "Calling update with " + JSON.stringify(data) );

            // Remove the existing s3 Object
            try {
              var pathKey = req.param('cPathKey');
              sails.log.debug( "trying to remove " + pathKey );
              var s3 = s3helper.s3;
              s3.remove( pathKey );
            } catch (e) {
              sails.log.error(e);
            }
            callback(null, path);
          }
        });
      },
      two: function(callback) {
        // This is sloppy - we depend on the failure of the upload to see if the user is trying to replace a file
        var receiving = SkipperS3.receive();
        req.file('pFile').upload(receiving, function onUploadComplete (err, uploadedFiles) {
          sails.log.info("Update coupon code image replacing existing file");
          if ( err ) return res.serverError( err );

          //sails.log.debug( JSON.stringify( uploadedFiles ) );

          var file = uploadedFiles[0];
          if ( !file ) {
            sails.log.info( "No Product File to update" );
            callback(null, null);
          } else {

            // add the new file information before saving
            var path = { key: file.extra.Key, bucket: file.extra.Bucket, mimetype:file.type, size:file.size};
            sails.log.info( "Calling update with " + JSON.stringify(data) );

            // Remove the existing s3 Object
            try {
              var pathKey = req.param('pPathKey');
              sails.log.debug( "trying to remove " + pathKey );
              var s3 = s3helper.s3;
              s3.remove( pathKey );
            } catch (e) {
              sails.log.error(e);
            }
            callback(null, path);
          }
        });
      }
    }, function (err, results) {
      if (results.one != null) {
        data.codePath = results.one;
      }
      if (results.two != null) {
        data.productPath = results.two;
      }
      // Get File data from both calls and save new file
      Content.update( { id: cid }, data ).exec( function ( err, ad ) {
        // Error handling
        if ( err ) return res.send( err, 500 );
        res.redirect( '/campaign/library' );
      } );

    });
  },

  edit: function(req, res) {
    var cid = req.param('cid');
    sails.log.debug(" Content Id: " + cid);

    Content.findOne().where(
      { id : cid }
    ).exec(function(err, c) {
        if (err) { sails.log.debug(err); }
        if ( c == undefined || c == null ) return res.send("Content not found", 404);
        res.view('campaign/content/edit', { c:c } );
      });

  },

  remove: function (req,res) {
    var cid = req.param('cid');
    // Check product/Campaign to see if this Ad is used.
    async.parallel({
      c: function(callback) {
        Campaign.native(function(err, collection) {
          if (err) return res.send(err, 500);
          sails.log.debug("Calling delete for " + cid);
          collection.find( {contents: {$all: [ {"$elemMatch":{ id:cid } } ] } }).toArray(
            function(err, campaigns) {
              sails.log.debug("In delete found " + campaigns.length+ " Campaigns.");
              var list = [];
              for (var i=0; i<campaigns.length; i++) {
                list.push({id: campaigns[i].id, title: campaigns[i].title});
              }
              callback(null, list);
            });
        });
      },
      p: function(callback) {
        // your code here
        Product.native(function(err, collection) {
          if (err) return res.send(err, 500);
          sails.log.debug("Calling delete for " + cid);
          collection.find( {contents: {$all: [ {"$elemMatch":{ id:cid } } ] } }).toArray(
            function(err, products) {
              sails.log.debug("In delete found " + products.length+ " Product.");
              var list = [];
              for (var i=0; i<products.length; i++) {
                list.push({id: products[i].id, title: products[i].name});
              }
              callback(null, list);
            });
        });
      }
    }, function (err, results) {
      var c = results.c;
      var p = results.p;
      sails.log.debug("found "+ c.length + "campaigns, and " + p.length + " products");
      if (c.length > 0 || p.length) {
        var msg = new MessageResponse();
        msg.error.campaigns = c;
        msg.error.products = p;
        res.json( msg );
      } else {
        Coupon.destroy().where(
          { id : cid }
        ).exec(function(err, content) {
            if (err) return res.send(new MessageResponse(false, 'Could not delete Coupon'),500);
            if ( content == undefined || content == null ) return res.send("content not found", 404);
            res.json( new MessageResponse(true) );
          });
      }

    });
  },
  newcontent: function(req, res) {
    res.view('campaign/content/new');
  }
};

function buildModel(req) {
  var data = modelhelper.parse(req);
  var model = {};
  model.title = data.title;
  model.description = data.description;
  model.duration = data.duration;
  model.mimetype = data.mimetype;

  var util = stringutil.util;
  // parse values
  var pdates = util.parseDateRange(data.presentationDates);
  model.presentationStartDate = pdates.start;
  model.presentationEndDate = pdates.end;

  var vdates = util.parseDateRange(data.validityDates);
  model.validStartDate = vdates.start;
  model.validEndDate = vdates.end;
  return model;
}
