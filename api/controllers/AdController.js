/**
 * AdController
 *
 * @description :: Server-side logic for managing Ads
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
 
var locals = require('../../config/local');
var base_directory = locals.s3BaseDirectory +'/ad/';
var SkipperS3 = require('skipper-s3')({ key: locals.s3AccessKey,
                                        secret: locals.s3SecretKey,
                                        bucket: locals.s3DefaultBucket,
                                        dirname: base_directory});
module.exports = {

    find: function(req, res) {
        var aid = req.param('aid');
        Ad.findOne({id:aid}).exec(function(err, ad) {
            if (err) { sails.log.warn(err); }
            res.json( ad );
        });

    },
    // JSON response
    list: function(req, res) {
        // do we filter by product???
        var pid = req.param('');

        Ad.find().exec(function(err, ads) {
            if (err) { sails.log.warn(err); }
            res.json( ads );
        });

    },

    upload: function(req, res) {
        var data = {
            name : req.param('name'),
            zone : req.param('zone'),
            target: req.param('target')
        };
        var subpath = calculateBasePath( base_directory, data.zone, data.target );
        sails.log.debug("saving file to subpath: " + subpath);
        var receiving = SkipperS3.receive({ dirname: subpath });
        req.file('adFile').upload(receiving, function onUploadComplete (err, uploadedFiles) {
            if (err) return res.serverError(err);

            sails.log.debug("Saved File: " + JSON.stringify(uploadedFiles));
            var file = uploadedFiles[0];
            if (file == null || file == undefined) {
                sails.log.error("File information was not returned");
            }

            var path = { key: file.extra.Key, bucket: file.extra.Bucket, mimetype:file.type, size:file.size};
            data.path = path;

            Ad.create( data ).exec(function(err, ad) {
                // Error handling
                if (err) return res.send(err,500);
                res.redirect('/campaign/library');
            });
        });

    },

    // Not used
    removeMedia: function(req, res) {
        var aid = req.param('aid');
        sails.log.info("Remove Media for " + aid);
        if (aid == undefined) return res.send("Ad id is required", 404);

        var s3 = s3helper.s3;
        Ad.findOne().where({ id: aid } ).exec(function(err, ad) {
            if (err) return res.send(err, 500);

            var objKey = ad.path.key;
            s3.remove( objKey );
            var updateAd = ad.toJSON();
            updateAd.path = null;
            updateAd.size = null;
            Ad.update( { id : aid }, updateAd ).exec(function(err, ad) {
                    // Error handling
                    if (err) return res.send(err,500);
                    res.json(ad);
                });
        });


    },

    edit: function(req, res) {
        var aid = req.param('aid');

        Ad.findOne().where(
            { id : aid }
        ).exec(function(err, ad) {
                if (err) { sails.log.debug(err); }
                if ( ad == undefined || ad == null ) return res.send("Ad not found", 404);
                res.view('campaign/ad/edit', { ad:ad } );
            });

    },

    update: function( req, res ) {
        var data = {
            id : req.param('aid'),
            name : req.param('name'),
            zone : req.param('zone'),
            target: req.param('target')
        }
        var subpath = calculateBasePath( base_directory, data.zone, data.target );
        var receiving = SkipperS3.receive({ dirname: subpath });
        // did we get a new file?
        req.file( 'adFile' ).upload( receiving, function onUploadComplete( err, uploadedFiles ) {
            if ( err ) return res.serverError( err );

            var file = uploadedFiles[0];
            if ( !file ) {
                Ad.update( { id: data.id }, data ).exec( function ( err, ad ) {
                        // Error handling
                        if ( err ) return res.send( err, 500 );
                        res.redirect( '/campaign/library' );
                } );
            } else {
                // add the new file information before saving
                var path = { key: file.extra.Key, bucket: file.extra.Bucket, mimetype:file.type, size:file.size};
                data.path = path;

                // Remove the existing s3 Object
                try {
                    var pathKey = req.param('pathKey');
                    var s3 = s3helper.s3;
                    s3.remove( pathKey );
                } catch (e) {
                    sails.log.error(e);
                }
                Ad.update( { id: data.id }, data ).exec( function ( err, ad ) {
                        // Error handling
                        if ( err ) return res.send( err, 500 );
                        res.redirect( '/campaign/library' );
                } );
            }
        } )
    },
    remove: function (req,res) {
        var aid = req.param('aid');
        // Check product/Campaign to see if this Ad is used.
        async.parallel({
            c: function(callback) {
                Campaign.native(function(err, collection) {
                    if (err) return res.send(err, 500);
                    sails.log.debug("Calling delete for " + aid);
                    collection.find( {ads: {$all: [ {"$elemMatch":{ id:aid } } ] } }).toArray(
                        function(err, campaigns) {
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
                    sails.log.debug("Calling delete for " + aid);
                    collection.find( {ads: {$all: [ {"$elemMatch":{ id:aid } } ] } }).toArray(
                        function(err, products) {
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
                var msg = new MessageResponse(false);
                msg.error.campaigns = c;
                msg.error.products = p;
                res.json( msg );
            } else {
                Ad.destroy().where(
                    { id : aid }
                ).exec(function(err, ad) {
                        if (err) return res.send(err,500);
                        if ( ad == undefined || ad == null ) return res.send("ad not found", 404);
                        res.json( new MessageResponse(true) );
                });
            }

        });
    },
    newad: function(req, res) {
        res.view('campaign/ad/newad');
    }
};

/**
 * Builds a path based on submitted parameters
 */
function calculateBasePath( base, zone, target ) {
    if ( zone === zones.zone.insertion ) {
        if (!target) { target = 'unknown'; }
        base += (zones.zone.windowed + '/' + zones.zone.insertion + '/' + target.toLowerCase() + '/');
    } else {
        base += (zone + '/');
    }
    return base;
}
