/**
 * CouponController
 *
 * @description :: Server-side logic for managing Contents
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var sid = require('shortid');
var express = require('express');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var multipart = require('connect-multiparty'),
    multipartyMiddleware = multipart();

var blobAdapter = require('skipper-disk');
var mime = require('mime');

var UPLOAD_PATH = "/data/assets/";

var locals = require('../../config/local');
var dirname = "/data/assets/";
var tempDir = dirname + 'tmp';
var flow = require('./flow-node.js')(tempDir);
var BingMapKey = 'AkJeLZ15t82hZ0HbdI-VRxNxH4YTAMqt_38zym2yt8_zRrfbO-oF4FNnfV3x4jTo';

// Setup id generator
sid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
sid.seed(42);

var base_directory = locals.s3BaseDirectory +'/content/';
var SkipperS3 = require('skipper-s3')({ key: locals.s3AccessKey,
  secret: locals.s3SecretKey,
  bucket: locals.s3DefaultBucket,
  dirname: base_directory});
//var Skipper = require('skipper')({
//
//});
  module.exports = {
   index: function (req, res) {
    res.view(null, {
        title: 'Marketability'
    });
   },

  findMedia: function(req, res) {
    var mid = req.param('id');
    Asset.findOne({id:mid}).exec(function(err, content) {
      if (err) { sails.log.warn(err); }
      sails.log.debug("Found " + content.name);
      res.json( content );
    });

  },
  findSchedule: function(req, res) {
    var sid = req.param('id');
    sails.log.debug("loading schedule with id : " + sid);
    Schedule.findOne({id:sid}).exec(
        function(err, content) {
           if (err) {
               return res.send(new MessageResponse(false, 'Could find schedule with id : '+sid),500);
           } else {
            sails.log.debug("Found schedule " + content);
            res.json( content );
          }
        });
  },
  company: function(req, res) {
    var nid = req.param('nid');
    var filter = { "in(NET_ASSET).@rid" : nid };
    var queryClause;
    if (nid) {
      var whereClause = 'from Company WHERE in(NET_ASSET).@rid='+nid;
      var query = dbclient.mbox.select(whereClause);
      return query.all()
        .then(function (contents) {
        sails.log.debug("Found ProductGroups : " + contents.length);
        res.json( contents );
      });
    } else {
      var query = dbclient.mbox.select().from('Company');
      return query.all()
        .then(function (contents) {
        sails.log.debug("Found ProductGroups : " + contents.length);
        res.json( contents );
      });
    }
  },
  products: function(req, res) {
    console.log('/dsn/product ');
    var tid = req.param('type');
    var nid = req.param('nid');
    var w = req.param('width');
    var h = req.param('height');
    var min = req.param('min', false);
    var limit = req.param('limit');
    var skip = req.param('skip');
    var filter = { "in(NET_ASSET).@rid" : nid };
    if (nid) {
      var whereClause = 'from Product WHERE in(NET_ASSET).@rid='+nid;
      var query = dbclient.mbox.select(whereClause);
      return query.all()
        .then(function (contents) {
        sails.log.debug("Found Products : " + contents.length);
        res.json( contents );
      });
    } else {
      var query = dbclient.mbox.select().from('Product');
      return query.all()
        .then(function (contents) {
        sails.log.debug("Found Products : " + contents.length);
        res.json( contents );
      });
    }

  },
  productGroups: function(req, res) {
    var tid = req.param('type');
    var nid = req.param('nid');
    var w = req.param('width');
    var h = req.param('height');
    var min = req.param('min', false);
    var limit = req.param('limit');
    var skip = req.param('skip');
    var filter = { "in(NET_ASSET).@rid" : nid };
    if (nid) {
      var whereClause = 'from ProductGroup WHERE in(NET_ASSET).@rid='+nid;
      var query = dbclient.mbox.select(whereClause);
      return query.all()
        .then(function (contents) {
        sails.log.debug("Found ProductGroups : " + contents.length);
        res.json( contents );
      });
    } else {
      var query = dbclient.mbox.select().from('ProductGroup');
      return query.all()
        .then(function (contents) {
        sails.log.debug("Found ProductGroups : " + contents.length);
        res.json( contents );
      });
    }

  },
  announcements: function(req, res) {
    sails.log.debug('/dsn/announcements');
    var tid = req.param('type');
    var nid = req.param('nid');
    var w = req.param('width');
    var h = req.param('height');
    var min = req.param('min', false);
    var limit = req.param('limit');
    var skip = req.param('skip');
    var filter = { "in(NET_ASSET).@rid" : nid };
    if (nid) {
      var whereClause = 'from Announcement WHERE in(NET_ASSET).@rid='+nid;
      var query = dbclient.mbox.select(whereClause);
      return query.all()
        .then(function (contents) {
        sails.log.debug("Found Announcements : " + contents.length);
        res.json( contents );
      });
    } else {
      Announcement.find(filter).exec(function(err, contents) {
         if (err) {
           sails.log.warn(err);
         } else {
           sails.log.debug("Found Announcements : " + contents.length);
           res.json( contents );
        }
      });
    }
  },
  announcementGroups: function(req, res) {
    var tid = req.param('type');
    var nid = req.param('nid');
    var w = req.param('width');
    var h = req.param('height');
    var min = req.param('min', false);
    var limit = req.param('limit');
    var skip = req.param('skip');
    var filter = { "in(NET_ASSET).@rid" : nid };
    if (nid) {
      var whereClause = 'from AnnouncementGroup WHERE in(NET_ASSET).@rid='+nid;
      var query = dbclient.mbox.select(whereClause);
      return query.all()
        .then(function (contents) {
        sails.log.debug("Found AnnouncementGroups : " + contents.length);
        res.json( contents );
      });
    } else {
      var query = dbclient.mbox.select().from('AnnouncementGroups');
      return query.all()
        .then(function (contents) {
        sails.log.debug("Found AnnouncementGroups : " + contents.length);
        res.json( contents );
      });
    }

  },

  media: function(req, res) {
//    var collection = Asset;
    var tid = req.param('type');
    if (tid) {
      switch (tid) {
        case 'company':
          company(req,res);
          return;
        case 'product':
          products(req,res);
          return;
        case 'productgroup':
          productGroups(req,res);
          return;
        case 'announcement':
          announcements(req,res);
          return;
        case 'announcementgroup':
          announcementGroups(req,res);
          return;
      }
    }
    var nid = req.param('nid');
    var w = req.param('width');
    var h = req.param('height');
    var min = req.param('min', false);
    if (nid) {
      var whereClause = 'from Asset WHERE in(NET_ASSET).@rid='+nid;
      if (w) {
        whereClause += " AND width ";
        if (min) {
           whereClause += " >= "+w;
        } else {
          whereClause += " = "+w;
        }
      }
      if (h) {
        whereClause += " AND height ";
        if (min) {
           whereClause += " >= "+h;
        } else {
          whereClause += " = "+h;
        }
      }
      var query = dbclient.mbox.select(whereClause);
      return query.all()
        .then(function (contents) {
        sails.log.debug("Found Assets : " + contents.length);
        res.json( contents );
      });
    } else {
        Asset.find(filter).exec(function(err, contents) {
           if (err) {
             sails.log.warn(err);
           } else {
             sails.log.debug("Found ProductGroups : " + contents.length);
             res.json( contents );
          }
        });
    }
    //  else {
    //   var query = dbclient.mbox.select().from('Asset');
    //   return query.all()
    //     .then(function (contents) {
    //     sails.log.debug("Found Assets : " + contents.length);
    //     res.json( contents );
    //   });
    // }
  },
//   mediaStuck: function(req, res) {
//
//     var tid = req.param('type');
//     var nid = req.param('nid');
//     var w = req.param('width');
//     var h = req.param('height');
//     var min = req.param('min', false);
//     var limit = req.param('limit');
//     var skip = req.param('skip');
//     var filter = { in(NET_ASSET).@rid : nid };
//     var whereClause = 'WHERE in(NET_ASSET).@rid='+nid;
//     var queryClause;
//
//     console.log('DSNController.media - nid : '+nid);
//     if (w) {
//         var width = parseInt(w);
//         var height = parseInt(h);
//         var minimum = (min == 'true') ? true : false;
//         console.log("DSNController , min : "+min.toString());
//         console.log("DSNController , minimum : "+minimum.toString());
//
//         if (minimum) {
//             console.log("DSNController , minimum/true : "+minimum.toString());
//             filter.width = { $gte : width };
//             filter.height = { $gte : height } ;
//         } else {
//             console.log("DSNController , minimum/false : "+minimum.toString());
//             filter.width = width;
//             filter.height = height;
//         }
//     }
//     if (tid) {
//         console.log('DSNController media: searching for : '+tid);
//         if (tid == 'product') {
//             queryClause = 'from Product '+whereClause;
//             if (limit) {
//                 var l = parseInt(limit);
//                 if (skip) {
//                     var sk = parseInt(skip);
//                     var query = dbclient.mbox.select().from('ProductGroup').where(filter).skip(sk).limit(l);
//                     return query.all()
//                       .then(function (contents) {
//                           sails.log.debug("Found ProductGroups : " + contents.length);
//                           res.json( contents );
//                       });
//
// //                    dbclient.db().ks.collection('productgroup').find(filter).skip(sk).limit(l).toArray(function(err, contents) {
// //                      if (err) { sails.log.warn(err); }
// //                      sails.log.debug("Found ProductGroups : " + contents.length);
// //                      res.json( contents );
// //                    });
//
//                 } else {
//
// //                    dbclient.db().ks.collection('productgroup').find(filter).limit(l).toArray(function(err, contents) {
//                     var query = dbclient.mbox.select().from('ProductGroup').where(filter).limit(l);
//                     return query.all()
//                       .then(function (contents) {
// //                      if (err) { sails.log.warn(err); }
//                       sails.log.debug("Found ProductGroups : " + contents.length);
//                       res.json( contents );
//                     });
//                 }
//             } else {
// //                dbclient.db().ks.collection('productgroup').find(filter).toArray(function(err, contents) {
//                 Asset.find(filter).exec(function(err, contents) {
// //                  if (err) { sails.log.warn(err); }
// //                var query = dbclient.mbox.select().from('ProductGroup').where(filter);
// //                return query.all()
// //                      .then(function (contents) {
//                   sails.log.debug("Found ProductGroups : " + contents.length);
//                   res.json( contents );
//                 });
//             }
//         }  else  if (tid == 'announcement') {
//             if (limit) {
//                 var l = parseInt(limit);
//                 if (skip) {
//                     var sk = parseInt(skip);
// //                    dbclient.db().ks.collection('announcementgroup').find(filter).skip(sk).limit(l).toArray(function(err, contents) {
//                     var query = dbclient.mbox.select().from('AnnouncementGroup').where(filter).skip(sk).limit(l);
//                     return query.all()
//                       .then(function (contents) {
//
// //                        if (err) { sails.log.warn(err); }
//                       sails.log.debug("Found AnnouncementGroups : " + contents.length);
//                       res.json( contents );
//                     });
//
//                 } else {
//                     //dbclient.db().ks.collection('announcementgroup').find(filter).limit(l).toArray(function(err, contents) {
//                     var query = dbclient.mbox.select().from('AnnouncementGroup').where(filter).limit(l);
//                     return query.all()
//                       .then(function (contents) {
// //                      if (err) { sails.log.warn(err); }
//                       sails.log.debug("Found AnnouncementGroups : " + contents.length);
//                       res.json( contents );
//                     });
//                 }
//             } else {
//                 var query = dbclient.mbox.select().from('AnnouncementGroup').where(filter);
//                 return query.all()
//                   .then(function (contents) {
// //                dbclient.db().ks.collection('announcementgroup').find(filter).toArray(function(err, contents) {
//         //        Asset.find(filter).exec(function(err, contents) {
// //                  if (err) { sails.log.warn(err); }
//                   sails.log.debug("Found AnnouncementGroups : " + contents.length);
//                   res.json( contents );
//                 });
//             }
//         }  else  if (tid == 'company') {
//             if (limit) {
//                 var l = parseInt(limit);
//                 if (skip) {
//                     var sk = parseInt(skip);
//                     var query = dbclient.mbox.select().from('Company').where(filter).skip(sk).limit(l);
//                     return query.all()
//                       .then(function (contents) {
// //                    dbclient.db().ks.collection('company').find(filter).skip(sk).limit(l).toArray(function(err, contents) {
// //                      if (err) { sails.log.warn(err); }
//                       sails.log.debug("Found Companies : " + contents.length);
//                       res.json( contents );
//                     });
//
//                 } else {
// //                    dbclient.db().ks.collection('company').find(filter).limit(l).toArray(function(err, contents) {
// //                      if (err) { sails.log.warn(err); }
//                     var query = dbclient.mbox.select().from('Company').where(filter).limit(l);
//                     return query.all()
//                       .then(function (contents) {
//                       sails.log.debug("Found Companies : " + contents.length);
//                       res.json( contents );
//                     });
//                 }
//             } else {
// //                dbclient.db().ks.collection('company').find(filter).toArray(function(err, contents) {
// //                  if (err) { sails.log.warn(err); }
//                     var query = dbclient.mbox.select().from('Company').where(filter);
//                     return query.all()
//                       .then(function (contents) {
//                   sails.log.debug("Found Companies : " + contents.length);
//                   res.json( contents );
//                 });
//             }
//         }  else  if (tid == 'feed') {
//
//
//         }  else  {
//             if (tid == 'web') {
//                 tid = 'text';
//             }
//             filter.mimetype = { $regex: '^'+tid, $options: 'i' };
//             //filter = { network : nid, mimetype : { $regex: '^'+tid, $options: 'i' } };
//             var search = JSON.stringify(tid);
//             console.log('DSNController.media searching for : '+tid);
//     //        var re = new RegExp('.*'+search+'.', 'i');
//     //        {"mimetype": {$regex: ".*"+search+".", $options:"i"}}
//             //{"name":{"$regex":/haag/i}}
//             if (limit) {
//                 var l = parseInt(limit);
//                 if (skip) {
//                     var sk = parseInt(skip);
// //                    dbclient.db().ks.collection('asset').find(filter).skip(sk).limit(l).toArray(function(err, contents) {
// //                      if (err) { sails.log.warn(err); }
//                     var query = dbclient.mbox.select().from('Asset').where(filter).skip(sk).limit(l);
//                     return query.all()
//                       .then(function (contents) {
//                       sails.log.debug("Found Media : " + contents.length);
//                       res.json( contents );
//                     });
//
//                 } else {
// //                    dbclient.db().ks.collection('asset').find(filter).limit(l).toArray(function(err, contents) {
// //                      if (err) { sails.log.warn(err); }
//                     var query = dbclient.mbox.select().from('Asset').where(filter).limit(l);
//                     return query.all()
//                       .then(function (contents) {
//                       sails.log.debug("Found Media : " + contents.length);
//                       res.json( contents );
//                     });
//                 }
//             } else {
// //                dbclient.db().ks.collection('asset').find(filter).toArray(function(err, contents) {
// //        //        Asset.find(filter).exec(function(err, contents) {
// //                  if (err) { sails.log.warn(err); }
// //                    var query = dbclient.mbox.select();
//                     var query = dbclient.mbox.select().from('Asset').where(filter);
//                     return query.all()
//                       .then(function (contents) {
//                   sails.log.debug("Found Media : " + contents.length);
//                   res.json( contents );
//                 });
//             }
//        }
//     } else {
//         console.log("DSNController , filter : "+JSON.stringify(filter));
// //        dbclient.db().ks.collection('asset').find(filter).toArray(function(err, contents) {
// //          if (err) { sails.log.warn(err); }
//         // select from Asset where in(NET_ASSET).@rid = #3961:0 and width >= 1920
// //        var networkQuery = "expand(out('NET_ASSET')) from Network where @rid="+nid;
// ////        var query = dbclient.mbox.select().from('Asset').where(filter);
// //        var query = dbclient.mbox.select(networkQuery);
// //        return query.all()
// //          .then(function (contents) {
//         Asset.find(filter).exec(function(err, contents) {
//           sails.log.debug("Found Media : " + contents.length);
//           res.json( contents );
//         });
// //
// //        Asset.find().exec(function(err, contents) {
// //          if (err) { sails.log.warn(err); }
// //          sails.log.debug("Found Media : " + contents.length);
// //          res.json( contents );
// //        });
//     }
//
//   },
  layouts: function(req, res) {
    // do we filter by product???
    var pid = req.param('');
    var nid = req.param('nid');
    var filter ={ 'network' : nid };

//    Layout.find(filter).exec(function(err, contents) {
//      if (err) { sails.log.warn(err); }
    var query = dbclient.mbox.select().from('Layout').where(filter);
    return query.all()
      .then(function (contents) {
      sails.log.debug("Found Layouts : " + contents.length);
      res.json( contents );
    });

  },
  productsOld: function(req, res) {
    // do we filter by product???
    var pid = req.param('');
    var nid = req.param('nid');
    var filter ={ 'network' : nid };

//    Product.find(filter).exec(function(err, contents) {
//      if (err) { sails.log.warn(err); }
    var query = dbclient.mbox.select().from('Product').where(filter);
    return query.all()
      .then(function (contents) {
      sails.log.debug("Found Products : " + contents.length);
      res.json( contents );
    });

  },
  productGroupsOld: function(req, res) {
    // do we filter by product???
    var pid = req.param('');
    var nid = req.param('nid');
    var filter ={ 'network' : nid };

//    ProductGroup.find(filter).exec(function(err, contents) {
//      if (err) { sails.log.warn(err); }
    var query = dbclient.mbox.select().from('ProductGroup').where(filter);
    return query.all()
      .then(function (contents) {
      sails.log.debug("Found ProductGroups : " + contents.length);
      res.json( contents );
    });

  },
  feeds: function(req, res) {
    // do we filter by product???
    var nid = req.param('nid');
    var filter ={ 'network' : nid };

//    Feed.find(filter).exec(function(err, contents) {
//      if (err) { sails.log.warn(err); }
    var query = dbclient.mbox.select().from('Feed').where(filter);
    return query.all()
      .then(function (contents) {
      sails.log.debug("Found Feeds : " + contents.length);
      res.json( contents );
    });

  },
  feedGroups: function(req, res) {
    // do we filter by product???
    var pid = req.param('');
    var nid = req.param('nid');
    var filter ={ 'network' : nid };

//    FeedGroup.find(filter).exec(function(err, contents) {
//      if (err) { sails.log.warn(err); }
    var query = dbclient.mbox.select().from('FeedGroup').where(filter);
    return query.all()
      .then(function (contents) {
      sails.log.debug("Found FeedGroups : " + contents.length);
      res.json( contents );
    });

  },
//   announcements: function(req, res) {
//     // do we filter by product???
//     var nid = req.param('nid');
//     var filter ={ 'network' : nid };
//
// //    Announcement.find(filter).exec(function(err, contents) {
// //      if (err) { sails.log.warn(err); }
//     var query = dbclient.mbox.select().from('Announcement').where(filter);
//     return query.all()
//       .then(function (contents) {
//       sails.log.debug("Found Announcements : " + contents.length);
//       res.json( contents );
//     });
//
//   },
//   announcementGroups: function(req, res) {
//     // do we filter by product???
//     var pid = req.param('');
//     var nid = req.param('nid');
//     var filter ={ 'network' : nid };
//
// //    AnnouncementGroup.find(filter).exec(function(err, contents) {
// //      if (err) { sails.log.warn(err); }
//     var query = dbclient.mbox.select().from('AnnouncementGroup').where(filter);
//     return query.all()
//       .then(function (contents) {
//       sails.log.debug("Found AnnouncementGroups : " + contents.length);
//       res.json( contents );
//     });
//
//   },
  rules: function(req, res) {
    // do we filter by product???
    var pid = req.param('');
    var nid = req.param('nid');
    var filter ={ 'network' : nid };

//    Rule.find(filter).exec(function(err, contents) {
//      if (err) { sails.log.warn(err); }
    var query = dbclient.mbox.select().from('Rule').where(filter);
    return query.all()
      .then(function (contents) {
      sails.log.debug("Found Rules : " + contents.length);
      res.json( contents );
    });

  },
  networks: function(req, res) {
    // do we filter by product???
    var pid = req.param('');

    Network.find().exec(function(err, contents) {
      if (err) { sails.log.warn(err); }
//    var query = dbclient.mbox.select().from('Network').where(filter);
//    return query.all()
//      .then(function (contents) {
      sails.log.debug("Found networks : " + contents.length);
      res.json( contents );
    });

  },
  displays: function(req, res) {
    // do we filter by product???
//    var did = req.param('');
    var nid = req.param('nid');
//    var filter ={ '@rid' : nid };
    var networkQuery = "expand(out('NET_DISPLAY')) from Network where @rid="+nid;
    console.log('displays : '+networkQuery);
//    var query = dbclient.mbox.select().from('Display').where(filter);
    var query = dbclient.mbox.select(networkQuery);
    return query.all()
      .then(function (contents) {
      sails.log.debug("Found Displays : " + contents.length);
      res.json( contents );
    });
//
//
//    Display.find(filter).exec(function(err, contents) {
//      if (err) { sails.log.warn(err); }
//      sails.log.debug("Found displays : " + contents.length);
//      res.json( contents );
//    });

  },
  displayGroups: function(req, res) {
    // do we filter by product???
//    var did = req.param('');
    var nid = req.param('nid');
//    var filter ={ 'network' : nid };
    var networkQuery = "expand(out('NET_DISPLAYGROUP')) from Network where @rid="+nid;
//        var query = dbclient.mbox.select().from('Asset').where(filter);
    console.log('displayGroups : '+networkQuery);
    var query = dbclient.mbox.select(networkQuery);
    return query.all()
          .then(function (contents) {
          sails.log.debug("Found DisplayGroups : " + contents.length);
          res.json( contents );
    });

      //
//    DisplayGroup.find(filter).exec(function(err, contents) {
//      if (err) { sails.log.warn(err); }
//      sails.log.debug("Found DisplayGroups : " + contents.length);
//      res.json( contents );
//    });

  },
  wheels: function(req, res) {
    // do we filter by product???
    var pid = req.param('');
    var nid = req.param('nid');
    var filter ={ 'network' : nid };

    Wheel.find(filter).exec(function(err, contents) {
      if (err) { sails.log.warn(err); }
      sails.log.debug("Found wheels : " + contents.length);
      res.json( contents );
    });

  },
  schedules: function(req, res) {
    // do we filter by product???
    var pid = req.param('');
    var nid = req.param('nid');
    var filter ={ 'network' : nid };

    Schedule.find(filter).exec(function(err, contents) {
      if (err) { sails.log.warn(err); }
      sails.log.debug("Found schedules : " + contents.length);
      res.json( contents );
    });

  },
  regions: function(req, res) {
    // do we filter by product???
    var lid = req.param('id');

    Region.find().exec(function(err, contents) {
      if (err) { sails.log.warn(err); }
      sails.log.debug("Found Regions : " + contents.length);
      res.json( contents );
    });

  },
  uploadNot: function(req, res) {
//      var file = req.file;
//      console.log("in upload, files : "+files);
//      for (var file in files) {
      var packet = req.params.all();
//      console.log('upload : '+req);
      console.log("logging keys for req :");
      console.log(Object.keys(req));

      console.log("logging keys for packet :");
      console.log(Object.keys(packet));

      var file = req.file;
      console.log("logging keys for packet :");
      if (file) {
//          var file = res.file(file);
    //          var file = req.file;
          console.log("in upload, file : "+file.name);
          id = sid.generate(),
          fileName = id + "." + fileExtension(safeFilename(file.name)),
          dirPath = UPLOAD_PATH + '/' + id,
          filePath = dirPath + '/' + fileName;

        try {
          mkdirp.sync(dirPath, 0755);
        } catch (e) {
          console.log(e);
        }

        fs.readFile(file.path, function (err, data) {
          if (err) {
            res.json({'error': 'could not read file'});
          } else {
            fs.writeFile(filePath, data, function (err) {
              if (err) {
                res.json({'error': 'could not write file to storage'});
              } else {
                processImage(id, fileName, filePath, function (err, data) {
                  if (err) {
                    res.json(err);
                  } else {
                    res.json(data);
                  }
                });
              }
            })
          }
        });
    //      }
      }
  },
  uploadS3: function(req, res) {
    var data = buildModel(req);
    console.log("DSN upload S3 : "+JSON.stringify(data));
    async.parallel({
      one: function(callback) {
        var receiving = SkipperS3.receive({
          saveAs: function(file) {
            var filename = data.filename;
            return filename;
          }
        });
        req.file('file').upload(receiving, function onUploadComplete (err, uploadedFiles) {
          if (err) return res.serverError(err);

          var file = uploadedFiles[0];
          if (file == null || file == undefined) {
            sails.log.error("File information was not returned 1");
          }
          console.log("file info : "+JSON.stringify(file));
          var path = { key : file.extra.Key, bucket: file.extra.Bucket, size: file.size, mimetype: file.type};
          callback(null, path);
        });
      }
    }, function (err, results) {

      console.log('do nothing here!');
      data.path = results.one;
      data.productPath = results.two;
      // Get File data from both calls and save new file
      Asset.create( data ).exec(function(err, c) {
        // Error handling
        if (err) {
            console.log("found and error : "+err);
            return res.send(err, 500);
        }
        res.send(200);
      });
    });
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
//        multipartMiddleware,
        flow.post(req, function(status, filename, original_filename, identifier) {
            console.log('POST', status, original_filename, identifier);
//            if (ACCESS_CONTROLL_ALLOW_ORIGIN) {
              res.header("Access-Control-Allow-Origin", "*");
//            }
            res.status(status).send();
        });

//        flow.post(req, function(status, filename, original_filename, identifier){
//            console.log('POST', status, original_filename, identifier);
//            res.send(200, {
//              // NOTE: Uncomment this funciton to enable cross-domain request.
//              'Access-Control-Allow-Origin': '*'
//            });
//        });
    }
  },
// TODO : how the heck do you do this?
//'/download/:identifier', function(req, res) {
//  flow.write(req.params.identifier, res);
//});
  upload: function(req, res) {
    var nid = req.param('nid');
    var data = buildModel(req);
    data.network = nid;
    console.log("DSN upload local : "+JSON.stringify(data));
    async.parallel({
      one: function(callback) {
        var ul = req.file('file');
        console.log("ul : "+ul);
        req.file('file').upload({
          dirname: tempDir,
          saveAs : function (__newFileStream, cb) {
              console.log('saveAs called, flowIdentifier : '+data.flowIdentifier+' , flowChunkNumber : '+data.flowChunkNumber+' , flowTotalChunks : '+data.flowTotalChunks);
//              var filename = data.filename;
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
          console.log('flowRelativePath : '+data.flowRelativePath);
          var fpath = dirname;
          var reldir = path.dirname(data.flowRelativePath);
          if (reldir) {
              fpath += reldir;
              data.path = reldir;
          }
          if(!fs.existsSync(fpath)) {
            console.log('making path : '+fpath);
            fs.mkdirSync(fpath);
          }
          fpath += '/'+file.filename;
          console.log('upload setting filePath : '+fpath);
          data.filepath = fpath;
          testComplete(data);
          callback(null, fpath);
        });
      }
    }, function (err, results) {

      console.log('do nothing here!');
      data.path = results.one;
//      data.productPath = results.two;
      // Get File data from both calls and save new file
      res.send(200);
//      if (data.flowChunkNumber == 1) {
//          Asset.create( data ).exec(function(err, asset) {
//            // Error handling
//            if (err) {
//                console.log("upload found an error : "+err);
//                return res.send(err,500);
//            }
//            //res.redirect('/dsn');
//            console.log('uploaded, asset created for path : '+data.codePath+" , asset : "+asset);
//            res.send(200);
//          });
//      } else {
//            console.log('uploaded chunk for path : '+data.codePath+" , chunk number : "+data.flowChunkNumber);
//            res.send(200);
//      }
    });
  },
  saveWheel: function(req, res) {
     var data = buildWheelModel(req);
     var lid = req.param('lid');
     if (lid) {
        // TODO is there a better way to do this?
        Wheel.update( { id: lid }, data ).exec( function ( err, wheel ) {
            // Error handling
            if ( err ) {
                console.log("saveWheel: update found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log(wheel);
                res.send(200);

                wheel.id = lid;
                var layoutIdList = [];
                layoutIdList.push(lid);
                propagateScheduleChanges(layoutIdList);
                console.log('back from propagateScheduleChanges');
            }
        } );

     } else {
        Wheel.create(data).exec( function ( err, wheel ) {
            // Error handling
            if ( err ) {
                console.log("saveWheel: create found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log(wheel);
                res.send(200);
            }
        } );
     }
  },

  saveDisplay: function(req, res) {
     var data = buildDisplayModel(req);
     var did = req.param('did');
     if (did) {
        // TODO is there a better way to do this?
        Display.update( { id: did }, data ).exec( function ( err, display ) {
            // Error handling
            if ( err ) {
                console.log("saveDisplay: update found an error : "+err);
                return res.send( err, 500 );
            } else {
                res.send(200);
            }
        } );



     } else {
        Display.create(data).exec( function ( err, display ) {
            // Error handling
            if ( err ) {
                console.log("saveDisplay: create found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log(display);
                res.send(200);
            }
        } );
     }
  },
  saveDisplayGroup: function(req, res) {
     var data = buildDisplayGroupModel(req);
     var dgid = req.param('dgid');
     if (dgid) {
        // TODO is there a better way to do this?
        DisplayGroup.update( { id: dgid }, data ).exec( function ( err, displaygroup ) {
            // Error handling
            if ( err ) {
                console.log("saveDisplayGroup: update found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log(displaygroup);
                res.send(200);
            }
        } );

     } else {
        DisplayGroup.create(data).exec( function ( err, displaygroup ) {
            // Error handling
            if ( err ) {
                console.log("saveDisplayGroup: create found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log(displaygroup);
                res.send(200);
            }
        } );
     }
  },
  saveSchedule: function(req, res) {
     var data = buildScheduleModel(req);
     var sid = req.param('sid');
     console.log('saveSchedule - sid : '+sid);
     if (sid) {
//        // TODO is there a better way to do this?
        Schedule.update( { id: sid }, data ).exec( function ( err, schedule ) {
            // Error handling
            if ( err ) {
                console.log("saveSchedule: update found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log(schedule);
                res.send(200);
            }
        } );

     } else {
        Schedule.create(data).exec( function ( err, schedule ) {
            // Error handling
            if ( err ) {
                console.log("saveSchedule: create found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log(schedule);
                res.send(200);
            }
        } );
     }
  },
  layout: function(req, res) {
     var lid = req.param('lid');
        // TODO is there a better way to do this?
    Layout.find( { id: lid }, data ).exec( function ( err, layout ) {
        // Error handling
        if ( err ) {
            console.log("layout: update found an error : "+err);
            return res.send( err, 500 );
        } else {
            console.log(layout);
            res.send(200);
        }
        Layout.find().exec(function(err, contents) {
              if (err) { sails.log.warn(err); }
              sails.log.debug("Found displays : " + contents.length);
              res.json( contents );
        });

    });
  },
  saveLayout: function(req, res) {
     var data = buildLayoutModel(req);
     var lid = req.param('lid');
     if (lid) {
        // TODO is there a better way to do this?
        Layout.update( { id: lid }, data ).exec( function ( err, layout ) {
            // Error handling
            if ( err ) {
                console.log("saveLayout: update found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log(layout);
                res.send(layout);

                layout.id = lid;
                var layoutIdList = [];
                propagateWheelChanges(layout, function(err1, layoutIdList) {
                    if (!err1) {
                        layoutIdList.push(lid);
                        propagateScheduleChanges(layoutIdList);
                        console.log('back from propagateScheduleChanges');
                    }
                });
            }
        } );

     } else {
        Layout.create(data).exec( function ( err, layout ) {
            // Error handling
            if ( err ) {
                console.log("saveLayout: create found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log(layout);
                res.send(layout);
            }
        } );
     }
  },
  saveMedia: function(req, res) {
     var data = buildMediaModel(req);
     var mid = req.param('mid');
     if (mid) {
        // TODO is there a better way to do this?
        Asset.update( { id: mid }, data ).exec( function ( err, media ) {
            // Error handling
            if ( err ) {
                console.log("saveLayout: update found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log('back from updating media : '+JSON.stringify(media));
                var data = buildMediaModel(req);
                propagateMediaChange(data);
                res.send(media);
            }
        } );

     } else {
        Asset.create(data).exec( function ( err, media ) {
            // Error handling
            if ( err ) {
                console.log("saveLayout: create found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log(media);
                res.send(media);
            }
        } );
     }
  },
  saveProduct: function(req, res) {
     var data = buildProductModel(req);
     var pid = req.param('pid');
     if (pid) {
        // TODO is there a better way to do this?
        Product.update( { id: pid }, data ).exec( function ( err, product ) {
            // Error handling
            if ( err ) {
                console.log("saveProduct: update found an error : "+err);
                return res.send( err, 500 );
            } else {
                product.id = pid;
                console.log("saveProduct: update : "+product.id);
//                console.log(product);
                res.send(product);
            }
        } );

     } else {
        Product.create(data).exec( function ( err, product ) {
            // Error handling
            if ( err ) {
                console.log("saveProduct: create found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log("saveProduct: create : "+product.id);
//                console.log(product);
                res.send(product);
            }
        } );
     }
  },
  saveFeed: function(req, res) {
     var data = buildFeedModel(req);
     var fid = req.param('fid');
     if (fid) {
        // TODO is there a better way to do this?
        Feed.update( { id: fid }, data ).exec( function ( err, feed ) {
            // Error handling
            if ( err ) {
                console.log("saveFeed: update found an error : "+err);
                return res.send( err, 500 );
            } else {
                feed.id = fid;
                console.log("saveFeed: update : "+feed.id);
//                console.log(feed);
                res.send(feed);
            }
        } );

     } else {
        Feed.create(data).exec( function ( err, feed ) {
            // Error handling
            if ( err ) {
                console.log("saveFeed: create found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log("saveFeed: update : "+feed.id);
//                console.log(feed);
                res.send(feed);
            }
        } );
     }
  },
  saveAnnouncement: function(req, res) {
     var data = buildAnnouncementModel(req);
     var aid = req.param('aid');
     if (aid) {
        // TODO is there a better way to do this?
        Announcement.update( { id: aid }, data ).exec( function ( err, announcement ) {
            // Error handling
            if ( err ) {
                console.log("saveWheel: update found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log(announcement);
                res.send(announcement);
                announcement.id = aid;
            }
        } );

     } else {
        Announcement.create(data).exec( function ( err, announcement ) {
            // Error handling
            if ( err ) {
                console.log("saveWheel: create found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log(announcement);
                res.send(announcement);
            }
        } );
     }
  },
  saveProductGroup: function(req, res) {
     var data = buildProductGroupModel(req);
     var pgid = req.param('pgid');
     if (pgid) {
        // TODO is there a better way to do this?
        ProductGroup.update( { id: pgid }, data ).exec( function ( err, productGroup ) {
            // Error handling
            if ( err ) {
                console.log("ProductGroup: update found an error : "+err);
                return res.send( err, 500 );
            } else {
                productGroup.id = pgid;
                console.log('saveProductGroup create : '+productGroup.id);
                res.send(productGroup);
            }
        } );

     } else {
        ProductGroup.create(data).exec( function ( err, productGroup ) {
            // Error handling
            if ( err ) {
                console.log("ProductGroup: create found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log('saveProductGroup create : '+productGroup.id);
                res.send(productGroup);
            }
        } );
     }
  },
  saveAnnouncementGroup: function(req, res) {
     var data = buildAnnouncementGroupModel(req);
     var gid = req.param('gid');
     if (gid) {
        // TODO is there a better way to do this?
        AnnouncementGroup.update( { id: gid }, data ).exec( function ( err, announcementGroup ) {
            // Error handling
            if ( err ) {
                console.log("saveAnnouncementGroup: update found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log(announcementGroup);
                res.send(announcementGroup);
            }
        } );

     } else {
        AnnouncementGroup.create(data).exec( function ( err, announcementGroup ) {
            // Error handling
            if ( err ) {
                console.log("saveAnnouncementGroup: create found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log(announcementGroup);
                res.send(announcementGroup);
            }
        } );
     }
  },
  saveFeedGroup: function(req, res) {
     var data = buildFeedGroupModel(req);
     var gid = req.param('gid');
     if (gid) {
        // TODO is there a better way to do this?
        FeedGroup.update( { id: gid }, data ).exec( function ( err, feedGroup ) {
            // Error handling
            if ( err ) {
                console.log("saveWheel: update found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log(feedGroup);
                res.send(feedGroup);
            }
        } );

     } else {
        FeedGroup.create(data).exec( function ( err, feedGroup ) {
            // Error handling
            if ( err ) {
                console.log("saveFeedGroup: create found an error : "+err);
                return res.send( err, 500 );
            } else {
                console.log(feedGroup);
                res.send(feedGroup);
            }
        } );
     }
  },
  findLayoutsWithMedia: function(req, res) {
    // do we filter by product???
    var mid = req.param('mid');
    if (mid) {
        // { 'voters.$.user': req.id }
        var filter ={ 'entries.$._id' : mid };
        console.log('DSNController searching for layouts containing media with : '+mid);
        Layout.find(filter).exec(function(err, contents) {
//        dbclient.db().ks.collection('layout').find(filter).toArray(function(err, contents) {
          if (err) { sails.log.warn(err); }
          sails.log.debug("Found Media : " + contents.length);
          res.json( contents );
        });
    }

  },
  scheduleWithLayoutElement: function(req, res) {
    // do we filter by product???
    var lid = req.param('lid');
    if (lid) {
        var filter ={ 'layouts.id' : lid };
        console.log('DSNController searching for schedules containing a layout with : '+lid);
//        dbclient.db().ks.collection('schedule').find(filter).skip(sk).limit(l).toArray(function(err, contents) {
//          if (err) { sails.log.warn(err); }
        var query = dbclient.mbox.select().from('Layout').where(filter);
        return query.all()
          .then(function (contents) {
          sails.log.debug("Found Schedule : " + contents.length);
          res.json( contents );
        });
    }
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
      Asset.update( { id: cid }, data ).exec( function ( err, ad ) {
        // Error handling
        if ( err ) {

            console.log("found and error : "+err);
            return res.send( err, 500 );
        }
        res.redirect( '/dsn/media' );
      } );

    });
  },

  edit: function(req, res) {
    var cid = req.param('cid');
    sails.log.debug(" Content Id: " + cid);

    Asset.findOne().where(
      { id : cid }
    ).exec(function(err, c) {
        if (err) { sails.log.debug(err); }
        if ( c == undefined || c == null ) return res.send("Content not found", 404);
        res.view('dsn/content/edit', { c:c } );
      });

  },
  removeSchedule: function (req,res) {
    var sid = req.param('sid');
    Schedule.destroy().where(
      { id : sid }
    ).exec(function(err, content) {
        if (err) return res.send(new MessageResponse(false, 'Could not delete schedule'),500);
        if ( content == undefined || content == null ) return res.send("schedule not found", 404);
        res.json( new MessageResponse(true) );
      });
  },
  removeProductGroup: function (req,res) {
    var pgid = req.param('pgid');
    if (pgid) {
        ProductGroup.destroy().where(
          { id : pgid }
        ).exec(function(err, content) {
            if (err) return res.send(new MessageResponse(false, 'Could not delete ProductGroup'),500);
            if ( content == undefined || content == null ) return res.send("ProductGroup not found", 404);
            res.json( new MessageResponse(true) );
          });
        }
  },
  removeAnnouncementGroup: function (req,res) {
    var sid = req.param('agid');
    AnnouncementGroup.destroy().where(
      { id : sid }
    ).exec(function(err, content) {
        if (err) return res.send(new MessageResponse(false, 'Could not delete AnnouncementGroup'),500);
        if ( content == undefined || content == null ) return res.send("AnnouncementGroup not found", 404);
        res.json( new MessageResponse(true) );
      });
  },
  removeFeedGroup: function (req,res) {
    var sid = req.param('fgid');
    FeedGroup.destroy().where(
      { id : sid }
    ).exec(function(err, content) {
        if (err) return res.send(new MessageResponse(false, 'Could not delete FeedGroup'),500);
        if ( content == undefined || content == null ) return res.send("FeedGroup not found", 404);
        res.json( new MessageResponse(true) );
      });
  },

  removeCampaign: function (req,res) {
    var cid = req.param('cid');
    // Check product/Campaign to see if this Ad is used.
    async.parallel({
      c: function(callback) {
        Campaign.native(function(err, collection) {
          if (err) return res.send(err, 500);
          sails.log.debug("Calling delete for " + cid);
          collection.find( {contents: {$all: [ {"$elemMatch":{ id:cid } } ] } }).toArray(
            function(err, media) {
              sails.log.debug("In delete found " + media.length+ " Content.");
              var list = [];
              for (var i=0; i<media.length; i++) {
                list.push({id: media[i].id, title: media[i].title});
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
      sails.log.debug("found "+ c.length + "media, and " + p.length + " products");
      if (c.length > 0 || p.length) {
        var msg = new MessageResponse();
        msg.error.media = c;
        msg.error.products = p;
        res.json( msg );
      } else {
        Coupon.destroy().where(
          { id : cid }
        ).exec(function(err, content) {
            if (err) return res.send(new MessageResponse(false, 'Could not delete Content'),500);
            if ( content == undefined || content == null ) return res.send("content not found", 404);
            res.json( new MessageResponse(true) );
          });
      }

    });
  },
  removeMedia: function (req,res) {
    var mid = req.param('mid');
    Asset.destroy().where(
      { id : mid }
    ).exec(function(err, content) {
        if (err) return res.send(new MessageResponse(false, 'Could not delete Media'),500);
        if ( content == undefined || content == null ) return res.send("content not found", 404);
        console.log('removed media for id : '+mid);
        res.json( new MessageResponse(true) );
      });
  },
  removeWheel: function (req,res) {
    // TODO : need to propagate this up to schedules
    var wid = req.param('wid');
    console.log('removing wheel : '+wid);
    Wheel.destroy().where(
      { id : wid }
    ).exec(function(err, content) {
        if (err) return res.send(new MessageResponse(false, 'Could not delete Wheel'),500);
        if ( content == undefined || content == null ) return res.send("wheel not found", 404);
        res.json( new MessageResponse(true) );
      });
  },
  removeLayout: function (req,res) {
    // TODO : need to propagate this up to wheels and schedules
    var lid = req.param('lid');
    Layout.destroy().where(
      { id : lid }
    ).exec(function(err, content) {
        if (err) return res.send(new MessageResponse(false, 'Could not delete Layout'),500);
        if ( content == undefined || content == null ) return res.send("layout not found", 404);
        res.json( new MessageResponse(true) );
      });
  },
  newcontent: function(req, res) {
    // TODO : here pull json from request for form data
    res.view('dsn/content/new');
  },
  mapImage: function(req, res) {
        var lat = req.param('lat');
        var lon = req.param('lon');
        var zoom = req.param('zoom');
        var imagerySet = "Road"; //AerialWithLabels
        var dim = "400,400";

        var centerPoint = lat+","+lon;
        var url ="http://dev.virtualearth.net/REST/v1/Imagery/Map/"+imagerySet+"/"+centerPoint+"/"+zoom+"?mapSize=400,400&key="+BingMapKey;
        res.redirect(url);

        var http = require('http');
        var fs = require('fs');

//    var download = function(url, dest, cb) {
        var file = fs.createWriteStream(dest);
        var request = http.get(url, function(response) {
            response.pipe(file);
            file.on('finish', function() {
              file.close(function() {
                  res.success();
              });  // close() is async, call cb after close completes.
            });
        }).on('error', function(err) { // Handle errors
            fs.unlink(dest); // Delete the file async. (But we don't check the result)
            if (cb) cb(err.message);
        });
//    };





  }
};

function buildModel(req) {
  // buildModel data keys : flowChunkNumber,flowChunkSize,flowCurrentChunkSize,flowTotalSize,flowIdentifier,flowFilename,flowRelativePath,flowTotalChunks

  var data = modelhelper.parse(req);
  console.log("request files : "+req.files);
  console.log("request file : "+req.file);
  console.log('buildModel data keys : '+Object.keys(data));
  console.log('flowFilename:'+data.flowFilename+' , flowChunkNumber:'+data.flowChunkNumber+' , flowTotalChunks:'+data.flowTotalChunks+' , flowChunkSize:'+data.flowChunkSize+' , flowIdentifier:'+data.flowIdentifier);
//  for (var key in Object.keys(data)) {
//      console.log(key+' = '+data[key]);
//  }
  var model = {};
  model.title = data.title;
  model.name = data.flowFilename;
  model.filename = data.flowFilename;
  data.filename = data.flowFilename;

  model.description = data.description;
  model.duration = data.duration;
  model.width = data.width;
  model.height = data.height;
  model.mimetype = mime.lookup(model.filename);
  model.size = data.flowTotalSize;
  model.network = data.network;
  model.flowChunkNumber = data.flowChunkNumber;
  model.flowChunkSize = data.flowChunkSize;
  model.flowCurrentChunkSize = data.flowCurrentChunkSize;
  model.flowTotalSize = data.flowTotalSize;
  model.flowIdentifier = data.flowIdentifier;
  model.flowFilename = data.flowFilename;
  model.flowRelativePath = data.flowRelativePath;
  model.flowTotalChunks = data.flowTotalChunks;
  console.log('buildModel data : '+JSON.stringify(model));
  var util = stringutil.util;
  return model;
}

function buildMediaModel(req) {
  // buildModel data keys : flowChunkNumber,flowChunkSize,flowCurrentChunkSize,flowTotalSize,flowIdentifier,flowFilename,flowRelativePath,flowTotalChunks

  var data = modelhelper.parse(req);
  console.log('buildMediaModel data : ');
  for (var key in Object.keys(data)) {
      console.log(key+' = '+data[key]);
  }

  var model = {};
  model.title = data.title;
  model.name = data.name;

  model.path = data.path;
  model.network = data.network;

//  model.filename = data.path;

  model.description = data.description;
  model.duration = data.duration;
  model.width = data.width;
  model.height = data.height;
  if (model.filename) {
    model.mimetype = mime.lookup(model.filename);
  }
  model.parameters = data.parameters;
  model.options = data.options;
  model.description = data.description;
  model.raw = data.raw;
  if (data.id) {
    model.id = data.id;
  }
//  var util = stringutil.util;
  return model;
}

function buildWheelModel(req) {
  var data = modelhelper.parse(req);
  console.log('buildWheelModel data : '+JSON.stringify(data));
  var model = {};
  model.name = data.name;
  model.description = data.description;
  model.layouts = data.layouts;
  model.tags = data.tags;
  model.network = data.network;
  return model;
}
function buildLayoutModel(req) {
  var data = modelhelper.parse(req);
  console.log('buildLayoutModel data : '+JSON.stringify(data));
  var model = {};
  model.name = data.name;
  model.description = data.description;
  // TODO : create regions
  model.regions = data.regions;
  model.tags = data.tags;
  model.width = data.width;
  model.height = data.height;
  model.template = data.template;
  model.network = data.network;
  model.backgroundLandscapeImage = data.backgroundLandscapeImage;
  model.backgroundPortraitImage = data.backgroundPortraitImage;
  return model;
}

function buildScheduleModel(req) {
  var data = modelhelper.parse(req);
//  console.log('buildScheduleModel data : '+JSON.stringify(data));
  var model = {};
  model.name = data.name;
  model.title = data.title;
  model.info = data.info;
  model.description = data.description;
  model.tags = data.tags;
  // TODO : create regions
  model.startDate = new Date(data.startDate);
  model.startsAt = new Date(data.startsAt);
  model.endsAt = new Date(data.endsAt);
  model.recurrence = data.recurrence;

//  model.recursOn = data.recursOn;
//  model.recDetail = data.recDetail;
  model.leType = data.leType;
  model.network = data.network;
  console.log('buildScheduleModel setting recurrence : '+model.recurrence);
//  if (data.recRange) {
//    model.recRange = new Date(data.recRange);
//    console.log('setting recRange : '+model.recRange);
//  }
  model.layoutElement = data.layoutElement;
  model.displayElements = data.displayElements;
  return model;
}

function buildDisplayGroupModel(req) {
  var data = modelhelper.parse(req);
  console.log('buildDisplayGroupModel data : '+JSON.stringify(data));
  var model = {};
  model.name = data.name;
  model.description = data.description;
  model.defaultLayout = data.defaultLayout;
  model.defaultLayoutType = data.defaultLayoutType;
  model.displays = data.displays;
  model.tags = data.tags;
  model.network = data.network;
  return model;
}

function buildDisplayModel(req) {
  var data = modelhelper.parse(req);
  console.log('buildDisplayModel data : '+JSON.stringify(data));
  var model = {};
  model.name = data.name;
  model.description = data.description;
  model.tags = data.tags;
  model.orientation = data.orientation;
  model.geometry = data.geometry;
  model.defaultLayout = data.defaultLayout;
  model.defaultLayoutType = data.defaultLayoutType;
  model.displayId = data.displayId;
  model.ipaddress = data.ipaddress;
  model.macaddress = data.macaddress;
  model.license = data.license;
  model.licensed = data.licensed;
  model.network = data.network;
  return model;
}

function buildModelAlt(req) {
  var data = {};
  var model = {};
  model.title = 'title';
  model.description = 'description';
  model.duration = 1500;
  model.mimetype = 'image/jpeg';

//  var util = stringutil.util;
//  // parse values
//  var pdates = util.parseDateRange(data.presentationDates);
//  model.presentationStartDate = pdates.start;
//  model.presentationEndDate = pdates.end;
//
//  var vdates = util.parseDateRange(data.validityDates);
//  model.validStartDate = vdates.start;
//  model.validEndDate = vdates.end;
  return model;
}



function buildProductModel(req) {
  var data = modelhelper.parse(req);
  console.log('buildProductModel data : '+JSON.stringify(data));
  var model = {};
  model.type = data.type;
  model.description = data.description;
  if (data.lat && data.lon) {
      model.location = data.lat+','+data.lon;
  }
  model.productDetail = data.productDetail;
  model.name = data.name;
  model.image = data.image;
  model.mapImage = data.mapImage;
  model.location = data.location;
  model.featured = data.featured;
  model.tags = data.tags;
  model.network = data.network;
  return model;
}

function buildProductGroupModel(req) {
  var data = modelhelper.parse(req);
  console.log('buildProductGroupModel data : '+JSON.stringify(data));
  var model = {};
  model.type = data.type;
  model.path = data.path;
  model.description = data.description;
  model.details = data.details;
  if (data.lat && data.lon) {
      model.location = data.lat+','+data.lon;
  }
  model.class = data.class;
  model.category = data.category;
  model.name = data.name;
  model.location = data.location;
  model.mapImage = data.mapImage;
  model.items = data.items;
  model.tags = data.tags;
  model.network = data.network;
  model.major = data.major;
  model.minor = data.minor;
  return model;

}

function buildFeedGroupModel(req) {
  var data = modelhelper.parse(req);
  console.log('buildFeedGroupModel data : '+JSON.stringify(data));
  var model = {};
  model.path = data.path;
  model.description = data.description;
  model.details = data.details;
  if (data.lat && data.lon) {
      model.location = data.lat+','+data.lon;
  }
  model.class = data.class;
  model.category = data.category;
  model.name = data.name;
  model.mapImage = data.mapImage;
  model.items = data.items;
  model.tags = data.tags;
  model.network = data.network;
  return model;

}
function buildAnnouncementGroupModel(req) {

  // Name	image	Location	Description	Tag	Details	Features
  var data = modelhelper.parse(req);
  console.log('buildAnnouncementGroupModel data : '+JSON.stringify(data));
  var model = {};
  model.name= data.name;
  model.path = data.path;
  model.image = data.image;
  model.location = data.location;
  model.description = data.description;
  model.details = data.details;
  model.features = data.features;
  model.items = data.items;
  model.tags = data.tags;
  model.network = data.network;
  return model;

}

function buildAnnouncementModel(req) {

  // Name	image	Location	Description	Tag	Details	Features
  var data = modelhelper.parse(req);
  console.log('buildAnnouncementModel data : '+JSON.stringify(data));
  var model = {};
  model.name= data.name;
  model.category= data.category;
  model.path = data.path;
  model.image = data.image;
  model.location = data.location;
  model.description = data.description;
  model.details = data.details;
  model.featured = data.featured;
  model.price = data.price;
  model.icon = data.icon;
  model.scanCode = data.scanCode;
  model.features = data.features;
  model.tags = data.tags;
  model.network = data.network;
  return model;

}

function safeFilename(name) {
  name = name.replace(/ /g, '-');
  name = name.replace(/[^A-Za-z0-9-_\.]/g, '');
  name = name.replace(/\.+/g, '.');
  name = name.replace(/-+/g, '-');
  name = name.replace(/_+/g, '_');
  return name;
}

function fileMinusExt(fileName) {
  return fileName.split('.').slice(0, -1).join('.');
}

function fileExtension(fileName) {
  return fileName.split('.').slice(-1);
}

function testComplete(data) {

        var currentChunkNumber = parseInt(data.flowChunkNumber);
        var totalChunks = parseInt(data.flowTotalChunks);
        var identifier = data.flowIdentifier;

        if (currentChunkNumber < totalChunks) {
            return;
        }
        console.log('testComplete currentChunkNumber : '+currentChunkNumber+' , totalChunks : '+totalChunks);
        var fileName = data.flowFilename;

        var filepath = data.filepath;
        var currentTestChunk = 1;
        var chunkFilename = flow.gcf(currentTestChunk, identifier);

        var cleanComplete = function(id) {
            console.log('clean complete for : '+id);
        }
        var assembleComplete = function(identifier) {
            // clean the flow identifiers in the asset
            delete data.flowChunkNumber;
            delete data.flowChunkSize;
            delete data.flowCurrentChunkSize;
            delete data.flowTotalSize;
            delete data.flowIdentifier;
            delete data.flowFilename;
            delete data.flowRelativePath;
            delete data.flowTotalChunks;

            flow.clean(identifier, { 'onDone' : cleanComplete })
            console.log('assembleComplete : '+JSON.stringify(data));
            if (stringStartsWith(data.mimetype, 'image')) {

                // TODO : this is an issue ( serialization )
//                ppHash(data);
//                ppThumb(data);
                async.parallel({
                        hash: function(callback) {
                            ppHash(data, function(err, h) {
                                callback(err, h)
                            });
                        },
                        dim: function(callback) {
                            ppSize(data, function(e, s) {
                                console.log('calling callback for width/height : '+s);
                                callback(e, s)
                            });
                        }
//                    ,
//                        thumb: function(callback) {
//                            ppThumb(data, function(err, t) {
//                                callback(err, t)
//                            });
//                        }
                    }, function (err, results) {
                       console.log("postprocessing ... : "+JSON.stringify(results));
                       data.md5 = results.hash;
//                       data.thumb = results.thumb;
                       var width = 0, height = 0;
                       if (results.dim && results.dim.width) {
                           width = results.dim.width;
                           height = results.dim.height;
                           console.log('pcallback width : '+width+' , height : '+height);
                       }
                       data.width =   parseInt(width);
                       data.height =  parseInt(height);
                       if (!data.duration) {
                          data.duration = 12;
                       }
                       if (!data.id)  {
                          Asset.create( data ).exec(function(e, asset) {
                            // Error handling
                            if (e) {
                                console.log("create asset found an error : "+e);
                                return;
                            }
                            //res.redirect('/dsn');
                            console.log('asset created for path : '+data.path+" , asset : "+asset);
                            return;
                          });
                       } else {
                           Asset.update( { id: data.id }, data ).exec( function ( e, result ) {
                                // Error handling
                                if ( e ) {
                                    console.log("asset update for media, found an error : "+e);
                                    return;
                                } else {
                                    console.log('asset update succeeded for media : ' + data.id);
                                    return;
                                }
                            } );
                       }
                    });
                } else if (stringStartsWith(data.mimetype, 'video')) {
                    async.parallel({
                        hash: function(callback) {
                            ppHash(data, function(e, h) {
                                console.log('calling callback for hash : '+h);
                                callback(e, h)
                            });
                        },
                        duration: function(callback) {
                            ppDuration(data, function(e, d) {
                                console.log('calling callback for duration : '+d);
                                callback(e, d)
                            });
                        },
                        dim: function(callback) {
                            ppSize(data, function(e, s) {
                                console.log('calling callback for width/height : '+s);
                                callback(e, s)
                            });
                        }
//                        ,
//                        thumb: function(callback) {
//                            ppThumb(data, function(e, t) {
//                                console.log('calling callback for thumb : '+t);
//                                callback(e, t)
//                            });
//                        }
                    }, function (err, results) {
                            // Error handling
                            if ( err ) {
                                console.log("post processing for media, found an error : "+err);
                                return;
                            }
                            console.log("postprocessing ... : "+JSON.stringify(results));
                            data.md5 = results.hash;
                            data.duration = results.duration;
                            var width = results.dim.width;
                            var height = results.dim.height;
                            console.log('pcallback width : '+width+' , height : '+height);

                            data.width =   parseInt(width);
                            data.height =  parseInt(height);
//                            data.thumb = results.thumb;
                            if (!data.id)  {
                              Asset.create( data ).exec(function(e, asset) {
                                // Error handling
                                if (e) {
                                    console.log("create asset found an error : "+e);
                                    return;
                                }
                                //res.redirect('/dsn');
                                console.log('asset created for path : '+data.path+" , asset : "+asset);
                                return;
                              });
                            } else {
                               Asset.update( { id: data.id }, data ).exec( function ( e, result ) {
                                    // Error handling
                                    if ( e ) {
                                        console.log("asset update for media, found an error : "+e);
                                        return;
                                    } else {
                                        console.log('asset update succeeded for media : ' + data.id);
                                        return;
                                    }
                                } );
                            }
                    });
            }
        }
        for (var i=1; i <= totalChunks; i++) {
            fs.exists(flow.gcf(i, identifier), function(exists) {
                if (!exists) {
                    return;
                }
            });
        }
        console.log('creating writeStream for : '+identifier+' , '+filepath);
        var stream = fs.createWriteStream(filepath);
        flow.write(identifier, stream, { 'onDone' : assembleComplete });
}

function stringStartsWith(string, prefix) {
    return string.slice(0, prefix.length) == prefix;
}

function ppDuration(media, cb) {
    var result = "";
    var ls;
    var err = null;
    var util = require('util'),
    spawn = require('child_process').spawn;
    ls    = spawn('/data/scripts/duration', [media.path]); // the second arg is the command
    ls.stdout.on('data', function (data) {    // register one or more handlers
        result += data;
    });

    ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
        err = data;
    });

    ls.on('exit', function (code) {
      // console.log('finished processing duration for : ' + media.id);
      // cb(err, result);
    	if (err) {
    		cb(err,null);
    	} else {
    		// parse for Duration here, instead of in script
    		var duration = result.replace(/(\r\n|\n|\r)/gm,"");
    		cb( null, duration);
    	}
    });
}

function ppHash(media, cb) {

    var result = "";
    var ls;
    var err;

    var util = require('util'),
    spawn = require('child_process').spawn;
    ls    = spawn('/data/scripts/hash', [media.path]); // the second arg is the command
    ls.stdout.on('data', function (data) {    // register one or more handlers
        result += data;
    });

    ls.stderr.on('data', function (data) {
       err = data;
    });

    ls.on('exit', function (code) {
    	if (err) {
    		cb(err,null);
    	} else {
    		var hash = result.replace(/(\r\n|\n|\r)/gm,"");
    		cb( null, hash );
    	}
      // console.log('finished processing duration for : ' + media.id);
      // cb(err, result);
    });
}
function ppSize(media, cb) {

    var result = "";
    var ls;
    var err;

    var util = require('util'),
    spawn = require('child_process').spawn;
    ls    = spawn('/data/scripts/sizeit', [media.path]); // the second arg is the command
    ls.stdout.on('data', function (data) {    // register one or more handlers
        result += data;
    });

    ls.stderr.on('data', function (data) {
       err = data;
    });

    ls.on('exit', function (code) {
    	if (err) {
    		cb(err,null);
    	} else {
    		var r = result.replace(/(\r\n|\n|\r)/gm,"");
            console.log(r);
            var json = { "width"  : 0 , "height" : 0 };
            if (r) {
                json = JSON.parse(r);
            }
            //json = JSON.parse(JSON.stringify(r).split('"_id":').join('"id":'));


    		cb( null, json );
    	}
      // console.log('finished processing duration for : ' + media.id);
      // cb(err, result);
    });
}

function ppThumb(media, cb) {

    var result = "";
    var ls;
    var err = null;
    var fn = media.path;
	var name = path.basename(fn,path.extname(fn));
	var dirName = path.dirname(fn);
	var thumbPath = dirName+'/'+name+'-thumb.png';


    var util = require('util'),
    spawn = require('child_process').spawn;
    if (stringStartsWith(media.mimetype,'image')) {
        ls    = spawn('/data/scripts/ithumb', [media.path, thumbPath]); // the second arg is the command
    } else if (stringStartsWith(media.mimetype,'video')) {
        ls    = spawn('/data/scripts/vthumb', [media.path, thumbPath]); // the second arg is the command
    }
    ls.stdout.on('data', function (data) {    // register one or more handlers
    	// all we really care about is if the thumb is created
        // console.log('ppThumb data : '+data);
        // result = data;
    });

    ls.stderr.on('data', function (data) {
       // console.log('ppThumb error : '+data);
       err = data;
       // cb(err, null);
       // console.log('stderr: ' + data);
    });

    ls.on('exit', function (code) {
      // console.log('finished processing ppThumb for : ' + media.id);
      // cb(err, result);

      var fs = require('fs'),
		  stats;

		try {
		  stats = fs.statSync(thumbPath);
		  cb(null, thumbPath);
		  console.log("File exists.");
		}
		catch (e) {
		  console.log("File does not exist.");
		  if (err) {
			  cb(err, null);
		  } else {
			  cb("thumb not created", null);
		  }
		}
    });
}

function pwd() {
    // or more concisely
    var sys = require('sys')
    var exec = require('child_process').exec;
    function puts(error, stdout, stderr) { sys.puts(stdout) }
    exec("ls -la", puts);
}

function convert(media) {
    // or more concisely
    var sys = require('sys')
    var exec = require('child_process').exec;
    function puts(error, stdout, stderr) { sys.puts(stdout) }
    exec("/usr/local/bin/convert ", puts);
    // convert -thumbnail 200x220^^ -gravity center -extent 200x200 -quality 80 $FN $filename-thumb.png
}


function propagateMediaChange(media) {
    var mid = media.id;
    sails.log.debug('looking for layoutsWithMedia : '+mid);
    layoutWithMedia(mid,function(layouts) {
        if (layouts) {

            for (var lidx = 0; lidx < layouts.length; lidx++) {
                var needToSave = false;
                var layout = layouts[lidx];
                console.log('found layouts with media : '+mid);
                if (layout.regions) {
                    var regions = layout.regions;
                    for (var ridx = 0; ridx < regions.length; ridx++) {
                        // find this media item
                        var region = regions[ridx];
                        if (region.entries) {
                            var entries = region.entries;
                            for (var eidx = 0; eidx < entries.length; eidx++) {
                                var entry = entries[eidx];
                                console.log('looking to match media in entry : '+entry.name);
                                // find this media item
                                if (mid == entry.id) {
                                    console.log("found media entry : "+entry.id);
                                    entries[eidx] = media;
                                    layout.regions[ridx].entries = entries;
                                    needToSave = true;
                                    // TODO : Do something here...
                                }
                            }
                        }
                    }
                }
                var layoutId = layout.id;
                Layout.update( { id: layoutId }, layout ).exec( function ( err, data ) {
                    // Error handling
                    if ( err ) {
                        console.log("saveLayout: update found an error : "+err);
                    } else {
                        console.log('updated layout : '+layoutId);
                        data.id = layoutId;
                        var layoutIdList = [];
                        propagateWheelChanges(data, function(err1, layoutIdList) {
                            if (!err1) {
                                layoutIdList.push(layoutId);
                                propagateScheduleChanges(layoutIdList);
                                console.log('back from propagateScheduleChanges');

                            }
                        });
                    }
                } );
            }
        }
    });
}

function propagateLayoutChange(layout) {
    var lid = layout.id.toString();
    var leids = []; // TODO: layout element ids ( will include wheel);
    leids.push (lid);
    console.log("look for wheels containing layout with id : "+lid);
    wheelWithLayout(lid, function(wheels) {
        if (wheels) {
            console.log("found wheels with layout : "+wheels.length);
            for (var widx = 0; widx < wheels.length; widx++) {
                var needToSaveWheel = false;
                var wheel = wheels[widx];
                var wheelId = wheel._id.toString();
//                console.log('adding wheel.id to leids : '+wheel._id.toString());
                // TODO : update this wheel, per layout change
                leids.push(wheelId);
                var layouts = wheel.layouts;
                if (layouts) {
                    for (var lidx=0; lidx < layouts.length; lidx++) {
                        var lo = layouts[lidx];
                        var layoutId = lo.id;
                        if (layoutId == lid) {
//                            layouts[lidx] = layout;
                            console.log('found layout in wheel to update, wheel : '+wheelId+' , layout : '+layoutId);
                            wheel.layouts[lidx] = layout;
                            needToSaveWheel = true;
                        }
                    }
                }
                if (needToSaveWheel) {
                    Wheel.update( { id: wheelId }, wheel ).exec( function ( err, data ) {
                        // Error handling

                        if ( err ) {
                            console.log("saveLayout: update found an error : "+err);
                        } else {
                            console.log('updated wheel : '+wheelId);
                        }
                    } );
                }
            }
            for (var lid_idx=0; lid_idx < leids.length; lid_idx++) {
                var leid = leids[lid_idx];
                scheduleWithLayoutElement(leid,function(schedules) {
                    if (schedules) {
                        for (var sidx = 0; sidx < schedules.length; sidx++) {
                            var needToSaveSchedule = false;
                            var schedule = schedules[sidx];
                            console.log("found schedule to update : "+schedule._id.toString());
                            if (schedule.layoutElement) {
                                var scheduleId = schedule._id.toString();
                                var layoutElement = schedule.layoutElement;
                                // layoutElement can be a layout or a wheel...
//                                if (leid == layoutElement.id.toString()) {
                                    var leType = schedule.leType;
                                    console.log("updating schedule with type : "+leType);

                                    switch (leType) {
                                        case 'wheel':
                                            console.log('looking for wheel with id : '+leid);
                                            Wheel.findOne( { id: leid } ).exec( function ( err, wheel ) {
                                                // Error handling
                                                if ( err ) {
                                                    console.log("could load wheel, error : "+err);
                                                } else {
                                                    needToSaveSchedule = true;
                                                    console.log('found wheel with which to update schedule : '+JSON.stringify(wheel));
                                                    wheel.id = leid;
                                                    delete wheel._id;
                                                    schedule.layoutElement = wheel;
                                                    Schedule.update( { id: scheduleId }, schedule ).exec( function ( err, data ) {
                                                        // Error handling
                                                        if ( err ) {
                                                            console.log("saveSchedule : update found an error : "+err);
                                                        } else {
                                                            console.log('updated schedule by propagattion for wheel : '+scheduleId);
                                                        }
                                                    } );
                                                }
                                            });
                                            break;
                                        case 'layout':
                                            Layout.findOne( { id: leid }).exec( function ( err, layout ) {
                                                // Error handling
                                                console.log('looking for layout with id : '+leid);
                                                if ( err ) {
                                                    console.log("could not load layout,  : "+err);
                                                } else {
                                                    needToSaveSchedule = true;
                                                    console.log(layout);
                                                    layout.id = leid;
                                                    delete layout._id;
                                                    schedule.layoutElement = layout;
                                                    Schedule.update( { id: scheduleId }, schedule ).exec( function ( err, data ) {
                                                        // Error handling
                                                        if ( err ) {
                                                            console.log("saveSchedule : update found an error : "+err);
                                                        } else {
                                                            console.log('updated schedule by propagattion for layout : '+scheduleId);
                                                        }
                                                    } );
                                                }
                                            });
                                            break;
                                    }
                                //}
                            }
                        }
                    }

                });
            }
        }
    });
}

function propagateWheelChange(wheel) {
    var lid = wheel.id.toString();
    scheduleWithLayoutElement(lid,function(schedules) {
        if (schedules) {
            for (var sidx = 0; sidx < schedules.length; sidx++) {
                var schedule = schedules[sidx];
                if (schedules.layouts) {
                    var layoutElement = schedules.layoutElement;
                    if (lid == layoutElement.id.toString()) {
                        console.log("found layout in schedule to be updated");
                    } else {
                        var layouts = layoutElement.layouts;
                        for (var lidx=0; lidx < layouts.length; lidx++) {
                            var sl = layouts[lidx];
                            if (lid == sl.id) {
                                console.log("found layout in schedule to be updated");
                            }
                        }
                    }
                }
            }
        }

    });
}

function propagateWheelChanges(layout, cb) {
    var lid = layout.id.toString();
    var leids = []; // TODO: layout element ids ( will include wheel);
    leids.push (lid);
    var affectedWheels = [];
    console.log("look for wheels containing layout with id : "+lid);
    wheelWithLayout(lid, function(wheels) {
        if (wheels && wheels.length > 0) {
            // done with the wheels
            async.each(wheels, function(wheel, callback ) {
                var wheelId = wheel._id.toString();
                affectedWheels.push(wheelId);
                var layouts = wheel.layouts;
                for (var lidx=0; lidx < layouts.length; lidx++) {
                    var lo = layouts[lidx];
                    var layoutId = lo.id;
                    if (layoutId == lid) {
                        console.log('found layout in wheel to update, wheel : '+wheelId+' , layout : '+layoutId);
                        wheel.layouts[lidx] = layout;
                    }
                }
                Wheel.update( { id: wheelId }, wheel ).exec( function ( err, data ) {
                    // Error handling
                    if ( err ) {
                        console.log("updating wheel had an error : "+err);
                    } else {
                        console.log(data);
                        callback();
                    }
                } );

            }, function(err){
                console.log('wheel changes complete');
                cb(err, affectedWheels);
                // there were no wheels to process, let the caller know
            });
        } else {
            // there were no wheels to process, let the caller know
            cb(null, affectedWheels);
        }
    });
}

function propagateScheduleChanges(layoutElementIdlist) {
    console.log('propagateScheduleChanges looking for schedules with layoutElement : '+layoutElementIdlist)
    async.each(layoutElementIdlist, function(lid, cb2 ) {
        scheduleWithLayoutElement(lid,function(schedules) {
            if (schedules && schedules.length > 0) {
                console.log('found schedules with layout element : '+schedules.length);
                async.each(schedules, function(schedule, cb3) {
                    if (lid == schedule.layoutElement.id) {
                        // update schedule and call cb3();
                        var scheduleId = schedule._id.toString();
                        var layoutElement = schedule.layoutElement;
                                // layoutElement can be a layout or a wheel...
                        var leType = schedule.leType;
                        console.log("updating schedule with type : "+leType);
                        switch (leType) {
                            case 'wheel':
                                console.log('looking for wheel with id : '+lid);
                                Wheel.findOne( { id: lid } ).exec( function ( err, wheel ) {
                                    // Error handling
                                    if ( err ) {
                                        console.log("could load wheel, error : "+err);
                                    } else {
                                        needToSaveSchedule = true;
                                        console.log('found wheel with which to update schedule : '+JSON.stringify(wheel));
                                        wheel.id = lid;
                                        delete wheel._id;
                                        schedule.layoutElement = wheel;
                                        Schedule.update( { id: scheduleId }, schedule ).exec( function ( err, data ) {
                                            // Error handling
                                            if ( err ) {
                                                console.log("saveSchedule : update found an error : "+err);
                                            } else {
                                                console.log('updated schedule by propagattion for wheel : '+scheduleId);
                                            }
                                            cb3(err);
                                        } );
                                    }
                                });
                                break;
                            case 'layout':
                                Layout.findOne( { id: lid }).exec( function ( err, layout ) {
                                    // Error handling
                                    console.log('looking for layout with id : '+lid);
                                    if ( err ) {
                                        console.log("could not load layout,  : "+err);
                                    } else {
                                        needToSaveSchedule = true;
                                        console.log(layout);
                                        layout.id = lid;
                                        delete layout._id;
                                        schedule.layoutElement = layout;
                                        Schedule.update( { id: scheduleId }, schedule ).exec( function ( err, data ) {
                                            // Error handling
                                            if ( err ) {
                                                console.log("saveSchedule : update found an error : "+err);
                                            } else {
                                                console.log('updated schedule by propagattion for layout : '+scheduleId);
                                            }
                                            cb3(err);
                                        } );
                                    }
                                });
                                break;
                        }
                    } else {
                        cb3(null);
                    }
                }, function(err1) {
                    console.log('processed schedule');
                    cb2(err1);
                });
            } else {
                // if no schedules found for this layoutElement, then complete for this lid
                cb2(null);
            }
        });
    }, function(err2) {
        // outside loop is done here, let the caller know
        console.log('propagateScheduleChanges is complete.');
    });

}


//scheduleWithLayoutElement(lid, function(schedules) {
//        if (schedules) {
//            for (var sidx = 0; sidx < schedules.length; sidx++) {
//                var schedule = schedules[sidx];
//                if (schedules.layouts) {
//                    var layoutElement = schedules.layoutElement;
//                    if (lid == layoutElement.id.toString()) {
//                        console.log("found layout in schedule to be updated");
//                    } else {
//                        var layouts = layoutElement.layouts;
//                        for (var lidx=0; lidx < layouts.length; lidx++) {
//                            var sl = layouts[lidx];
//                            if (lid == sl.id) {
//                                console.log("found layout in schedule to be updated");
//                            }
//                        }
//                    }
//                }
//            }
//        }
//
//});

 function layoutWithMedia(mid, cb) {
        var filter ={ 'regions.entries.id' : mid };
//        console.log('DSNController searching for layouts containing media with : '+mid);
        Layout.find(filter).exec(function(err, contents) {
          if (err) { sails.log.warn(err); }
          sails.log.debug("Found layouts with media : " + contents.length);
          cb(contents);
        });
  }

  function scheduleWithLayoutElement(lid, cb) {
        var filter ={ 'layoutElement.id' : lid };
//        console.log('DSNController searching for schedules containing a layoutElement with : '+lid);
//        dbclient.db().ks.collection('schedule').find(filter).toArray(function(err, contents) {
//          if (err) { sails.log.warn(err); }
//          sails.log.debug("Found Schedules with layoutElement : " + contents.length);
        var query = dbclient.mbox.select().from('Schedule').where(filter);
        return query.all()
          .then(function (contents) {
          cb( contents );
        });
  }

  function wheelWithLayout(lid, cb) {
        console.log('DSNController searching for wheels containing a layout with : '+lid);
        var filter ={ 'layouts.id': lid };
//        dbclient.db().ks.collection('wheel').find(filter).toArray(function(err, contents) {
//          if (err) { sails.log.warn(err); }
    var query = dbclient.mbox.select().from('Wheel').where(filter);
    return query.all()
      .then(function (contents) {
          sails.log.debug("Found Wheels with layout : " + contents.length);
          cb( contents );
        });
  }
