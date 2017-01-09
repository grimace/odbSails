/**
 * NetworkController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var sid = require('shortid');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var multipart = require('connect-multiparty'),
    multipartyMiddleware = multipart();
//var io = require('socket.io');
var blobAdapter = require('skipper-disk');
var mime = require('mime');

var UPLOAD_PATH = "/data/assets/";

var locals = require('../../config/local');
var dirname = "/data/assets/";
var tempDir = dirname + 'tmp';
var flow = require('./flow-node.js')(tempDir);

// Setup id generator
sid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
sid.seed(42);

var base_directory = locals.s3BaseDirectory +'/content/';
var SkipperS3 = require('skipper-s3')({ key: locals.s3AccessKey,
  secret: locals.s3SecretKey,
  bucket: locals.s3DefaultBucket,
  dirname: base_directory});

module.exports = {


  index: function (req, res) {
    res.view(null, {
        title: 'Network'
    });
  },

  savecompanyinfo: function(req, res) {
     var cid = req.param('cid');
     var data = buildCompanyInfoModel(req);
     if (cid) {
        // TODO is there a better way to do this?
        Company.update( { id: cid }, data ).exec( function ( err, company ) {
            // Error handling
            if ( err ) {
                console.log("saveCompanyInfo: update found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log('savecompanyinfo-update : '+JSON.stringify(company[0]));
                company.id = cid;
                res.json({ data: company[0] })
            }
        } );

     } else {
        Company.create(data).exec( function ( err, company ) {
            // Error handling
            if ( err ) {
                console.log("saveCompanyInfo: create found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log('savecompanyinfo-create : '+JSON.stringify(company[0]));
                res.json({ data: company[0] })
            }
        } );
     }
  },
//  companyinfo2: function(req, res) {
//    var nid = req.param('nid');
//    sails.log('Loading Company info for network : '+nid);
//    CompanyInfo.findOne({ network:nid).exec(function(err, content) {
//      if (err) { sails.log.warn(err); }
//      sails.log.debug("Found " + content.name);
//      res.json( content );
//    });
//  },
  companyinfo: function(req, res) {
    var nid = req.param('nid');
    //var filter = { "in(NET_ASSET).@rid" : nid };
    var queryClause;
    if (nid) {
      var whereClause = 'from Company WHERE in(NET_ASSET).@rid='+nid;
      var query = dbclient.mbox.select(whereClause);
      return query.all()
        .then(function (contents) {
        sails.log.debug("Found Company : " + contents.length);
        res.json( contents[0] );
      });
    } else {
      var query = dbclient.mbox.select().from('Company');
      return query.all()
        .then(function (contents) {
        sails.log.debug("Found ProductGroups : " + contents.length);
        res.json( contents );
      });
    }
//
//
//
//     var nid = req.param('nid');
//     var filter ={ 'network' : nid };
// //    dbclient.db().ks.collection('company').findOne(filter).exec(function(err, content) {
// //      if (err) { sails.log.warn(err); }
// //      sails.log.debug("Found " + content.name);
// //      res.json( content );
// //    });
// //    dbclient.db().ks.collection('company').findOne(filter,
// //        function(err, content) {
// //            if (err) { sails.log.warn(err); }
//         console.log('dbclient : '+dbclient);
//         console.log('dbclient.mbox : '+dbclient.mbox);
//
//         var query = dbclient.mbox.select().from('Company').where(filter);
//         return query.all()
//           .then(function (contents) {
//             sails.log.debug("Found " + JSON.stringify(contents))
//             res.json( contents );
//     });
  },
  uploadFlow: function(req, res) {

    if(req.method === 'GET') {
        flow.get(req, function(status, filename, original_filename, identifier){
            console.log('GET', status);
            res.send(200, {
                'Access-Control-Allow-Origin': '*'
                (status == 'found' ? 200 : 404)
            });
        });
    } else {
        var data = buildModel(req);
        flow.post(req, function(status, filename, original_filename, identifier) {
            console.log('POST', status, original_filename, identifier);
            res.header("Access-Control-Allow-Origin", "*");
            res.status(status).send();
        });
    }
 },
// TODO : how the heck do you do this?
//'/download/:identifier', function(req, res) {
//  flow.write(req.params.identifier, res);
//});
  upload: function(req, res) {
    var data = buildModel(req);
    console.log("DSN upload local : "+JSON.stringify(data));
    async.parallel({
      one: function(callback) {
        var ul = req.file('file');
        console.log("ul : "+ul);
        req.file('file').upload({
          dirname: tempDir,
          saveAs : function (__newFileStream, cb) {
              console.log('saveAs called, flowIdentifier : '+data.flowIdentifier+' , flowChunkNumber : '+data.flowChunkNumber+' , flowTotalChunks : '+data.flowTotalChunks);
              var filename = flow.gcf(data.flowChunkNumber, data.flowIdentifier);
              console.log('saveAs response : '+filename);
              cb(null, filename);
          }
        }, function onUploadComplete (err, uploadedFiles) {
          if (err) return res.serverError(err);
          console.log("uploadedFiles size : "+uploadedFiles.length);
          var file = uploadedFiles[0];
          if (file == null || file == undefined) {
            sails.log.error("File information was not returned 1");
          }
          //data.name = file.filename;
          console.log("file info : "+JSON.stringify(file));
          console.log('onUploadComplete called, flowIdentifier : '+data.flowIdentifier+' , flowChunkNumber : '+data.flowChunkNumber+' , flowTotalChunks : '+data.flowTotalChunks);
          var path = dirname + file.filename;
          data.filepath = path;
          testComplete(data);
          callback(null, path);
        });
      }
    }, function (err, results) {

      console.log('do nothing here!');
      data.path = results.one;
      res.send(200);
    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to HomeController)
   */
  _config: {}


};

function buildCompanyInfoModel(req) {

  var data = modelhelper.parse(req);
  console.log('buildCompanyInfoModel data : '+JSON.stringify(data));
  var model = {};
  model.assetType = data.assetType;
  model.name = data.name;
  model.description = data.description;
  model.tags = data.tags;

//  model.companyTitle = data.companyTitle;
//  model.companyAddr = data.companyAddr;
//  model.companyPhone = data.companyPhone;
//  model.companyWeb = data.companyWeb;

  model.logo = data.logo;

  model.companyTitle = data.companyTitle;
  model.companyInfo = data.companyInfo;
  model.companyImage = data.companyImage;


  model.mainTitle = data.mainTitle;
  model.mainInfo = data.mainInfo;
  model.mainImage = data.mainImage;
  model.backgroundImage = data.backgroundImage;
  model.phone = data.phone;
  model.web = data.web;
  model.email = data.email;
  model.hours = data.hours;
  model.address = data.address;
  model.network = data.network;
  return model;

}
