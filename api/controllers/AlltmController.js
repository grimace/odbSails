/**
 * ReportController
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

module.exports = {

    // terminal information
    alltmTerminal: function (req, res) {
        var terminalId = req.param("terminalId");
        var atmList = [];

        //var findCallback = function(err, results) {
        //  if (err) {
        //    sails.log.error(err);
        //  }
        //  sails.log.debug("query found : " + results.length);
        //  var fc = {};
        //  fc.type = "FeatureCollection";
        //  var metadata = {};
        //  fc.metadata = metadata;
        //  metadata.generated = 1363529248000;
        //  metadata.url = "http://www.kombicorp.com";
        //  metadata.title = "Kombi Kiosk ATM Locations";
        //  metadata.subTitle = "Real-time, Kombi Kiosk location information";
        //  metadata.cacheMaxAge = "900";
        //  fc.features = [];
        //  for (var i = 0; i < results.length; i++) {
        //    var atm = results[i];
        //    var feature = {};
        //    feature.type = "Feature";
        //    feature.id = atm.id;
        //
        //    var properties = {};
        //    feature.properties = properties;
        //    properties.terminalId = atm.terminalId;
        //    properties.macAddress = atm.macAddress;
        //    properties.status = atm.status;
        //    properties.topper = atm.topper;
        //
        //    var geometry = {};
        //    geometry.type = atm.geometry.type;
        //    geometry.coordinates = atm.geometry.coordinates;
        //    feature.geometry = geometry;
        //    geometry.coordinates.push(0.0);
        //    fc.features.push(feature);
        //  }
        //  res.json(fc);
        //};

//        db.query(
//           "SELECT FROM POI "
//           + "WHERE DISCRIMINATOR='ATM' AND terminalId = '"+terminalId+"'"
//        ).then(function(results){
//           console.log(results)
//           var term = results[0];
////        });
////        dbclient.mbox.command("SELECT FROM POI Where DISCRIMINATOR='ATM' AND terminalId='"+terminalId+"'", function(err, results) {
//
////        dbclient.db().neocard.collection('poi').findOne({ DISCRIMINATOR : 'ATM', terminalId : terminalId }, function(err, term) {
//            sails.log.debug('alltmTerminal found : '+ term.terminalId);
//            var atm = {};
//            atm.terminalId = term.terminalId;
//            atm.place = term.address1 + ", " + term.city + ", " + term.state;
//            atm.zip = term.zip;
//            atm.model = term.model;
//
//            var geometry = {};
//            geometry.type = term.geometry.type;
//            geometry.coordinates = term.geometry.coordinates;
//            geometry.coordinates.push(0.0);
//            atm.geometry = geometry;
//
//            // Send a JSON response
//            res.json(atm);
//        });
            res.json(atm);
    },

    map: function (req, res) {
        sails.log.debug("calling map...");
//        dbclient.db().geo.collection('GeoInfo').find({ DISCRIMINATOR : 'ZCTA' }).limit(1000).toArray(
//            function(err, results) {

        var fc = {};
        fc.type = "FeatureCollection";
        var metadata = {};
        fc.metadata = metadata;
        metadata.generated = 1363529248000;
        metadata.url = "http://www.kombicorp.com/cardtronics";
        metadata.title = "ZCTA Center Locations";
        metadata.subTitle = "Estimated Center Points of ZCTAs";
        metadata.cacheMaxAge = "900";
        fc.features = [];

        res.json(fc);
//        dbclient.mbox.command("SELECT FROM GeoInfo Where DISCRIMINATOR='ZCTA' LIMIT 1000", function(err, results) {
//                
//                if (err) {
//                    sails.log.error(err);
//                }
//
//                var fc = {};
//                fc.type = "FeatureCollection";
//                var metadata = {};
//                fc.metadata = metadata;
//                metadata.generated = 1363529248000;
//                metadata.url = "http://www.kombicorp.com/cardtronics";
//                metadata.title = "ZCTA Center Locations";
//                metadata.subTitle = "Estimated Center Points of ZCTAs";
//                metadata.cacheMaxAge = "900";
//                fc.features = [];
//                for (var i=0; i < results.length; i++) {
//                    var zcta = results[i];
//                    var feature = {};
//                    feature.type ="Feature";
//                    feature.id = zcta.id;
//                    var properties = {};
//                    feature.properties = properties;
//                    properties.zip = zcta.zipCode;
//                    properties.state = zcta.sn;
//                    properties.population = zcta.population;
//                    properties.time = new Date().getTime();
//                    var geometry = {};
//                    geometry.type = 'Point';
//                    var bb = zcta.zcbb;
//                    var coordinates = [];
//                    coordinates.push(bb[2]+bb[0]/2)
//                    coordinates.push(bb[3]+bb[1]/2);
//                    coordinates.push(0.0);
//                    geometry.coordinates = coordinates;
//
//                    feature.geometry = geometry;
//                    fc.features.push(feature);
//                }
//                // close the db
//                res.json(fc);
//
//            });
    },

    'hashList' : function(req, res) {
        sails.log.info("Calling hashList");
        var hashlist = [];
        res.json(jashlist);
//        var alltmOnly = req.param("alltmOnly", "true");
//        var filter = { DISCRIMINATOR : 'ATM', geometry : { $exists : true }};
//        if (alltmOnly === "true") {
//            var filter ={ DISCRIMINATOR : 'ATM', geometry : { $exists : true }, 'service.currentStatus' : 'active' };
//            sails.log.debug ("Filtering by alltmOnly");
//        }
//        var atmList = [];
//        // Locate all the entries using find
//        sails.log.info("hashList filter : "+filter);
////        dbclient.db().neocard.collection('poi').find( filter, { geohash : 1 }).toArray(function(err, results) {
//        dbclient.mbox.command("SELECT FROM POI Where DISCRIMINATOR='ZCTA' LIMIT 1000", function(err, results) {
//
//            
//            if (err) {
//                sails.log.debug(err);
//            }
//            var hashlist = [];
//            sails.log.debug(" get hash query found : "+results.length);
//            for (var i=0; i < results.length; i++) {
//                var cluster;
//                var atm = results[i];
//                if (atm.geohash != null) {
//                    var geohash = atm.geohash.substring(0,1);
//                    if (hashlist.indexOf(geohash) < 0) {
//                        hashlist.push(geohash);
//                    }
//                }
//            }
//            sails.log.info(hashlist.length);
//            sails.log.info("Hashlist: "  + hashlist);
//            res.json(hashlist);
//
//        });
    },
    'kioskList' : function(req, res) {
      sails.log.info("Calling kioskList");
      var hashlist = [];
      res.json(jashlist);
  
//      var alltmOnly = req.param("alltmOnly", "false");
//      var filter = { DISCRIMINATOR : 'ATM', geometry : { $exists : true }};
//      if (alltmOnly === "true") {
//        var filter ={ DISCRIMINATOR : 'ATM', geometry : { $exists : true }, 'service.currentStatus' : 'active' };
//        sails.log.debug ("Filtering by alltmOnly");
//      }
//      var atmList = [];
//      // Locate all the entries using find
//      sails.log.info("hashList filter : "+filter);
//      //dbclient.db().neocard.collection('poi').find( filter, { geohash : 1 }).toArray(function(err, results) {
//      //  if (err) {
//      //    sails.log.debug(err);
//      //  }
//      //  var hashlist = [];
//      //  sails.log.debug(" get hash query found : "+results.length);
//      //  for (var i=0; i < results.length; i++) {
//      //    var cluster;
//      //    var atm = results[i];
//      //    if (atm.geohash != null) {
//      //      var geohash = atm.geohash.substring(0,1);
//      //      if (hashlist.indexOf(geohash) < 0) {
//      //        hashlist.push(geohash);
//      //      }
//      //    }
//      //  }
//      //  sails.log.info(hashlist.length);
//      //  sails.log.info("Hashlist: "  + hashlist);
//      //  res.json(hashlist);
//      //
//      //});
//      dbclient.db().neocard.collection('poi').find( filter).toArray(function(err, results) {
//        if (err) {
//          sails.log.debug(err);
//        }
//        var hashlist = [];
//        sails.log.debug(" get hash query found : "+results.length);
//        for (var i=0; i < results.length; i++) {
//          var cluster;
//          var atm = results[i];
//          if (atm.geohash != null) {
//            var geohash = atm.geohash.substring(0,1);
//            if (hashlist.indexOf(geohash) < 0) {
//              hashlist.push(geohash);
//            }
//          }
//        }
//        sails.log.info(hashlist.length);
//        sails.log.info("Hashlist: "  + hashlist);
//        res.json(hashlist);
//
//      });
    },
  'kioskListPaged' : function(req, res) {
        var fc = {};
        fc.type = "FeatureCollection";
        var metadata = {};
        fc.metadata = metadata;
        metadata.generated = 1363529248000;
        metadata.url = "http://www.kombicorp.com";
        metadata.title = "Kombi Kiosk ATM Locations";
        metadata.subTitle = "Real-time, Kombi Kiosk location information";
        metadata.cacheMaxAge = "900";
        fc.features = [];
        res.json(fc);
//      
//      
//    var alltmOnly = req.param("alltmOnly", "false");
//    var page = parseInt(req.param("page", 1000));
//    var index = parseInt(req.param("index", 0));
//    sails.log.info("Calling kioskListPaged , index : "+index+" , page : "+page);
//    alltmOnly = false;  // assume all of them for now
//    var filter = { DISCRIMINATOR : 'ATM', geometry : { $exists : true }};
//    //if (alltmOnly === "true") {
//    //  var filter ={ DISCRIMINATOR : 'ATM', geometry : { $exists : true }, 'service.currentStatus' : 'active' };
//    //  sails.log.debug ("Filtering by alltmOnly");
//    //}
//    //if (index > 0) {
//    //  filter.skip = index;
//    //}
//    var atmList = [];
//    sails.log.info("kioskListPaged filter : "+JSON.stringify(filter));
//    if (index >= 0) {
//      dbclient.db().neocard.collection('poi').find( filter, {terminalId:1, macAddress :1 , geometry:1, topper:1, status:1 }).skip(index).limit(page).toArray(
//        function(err, results) {
//          if (err) {
//            sails.log.error(err);
//          }
//          sails.log.debug("query found : " + results.length);
//          var fc = {};
//          fc.type = "FeatureCollection";
//          var metadata = {};
//          fc.metadata = metadata;
//          metadata.generated = 1363529248000;
//          metadata.url = "http://www.kombicorp.com";
//          metadata.title = "Kombi Kiosk ATM Locations";
//          metadata.subTitle = "Real-time, Kombi Kiosk location information";
//          metadata.cacheMaxAge = "900";
//          fc.features = [];
//          for (var i = 0; i < results.length; i++) {
//            var atm = results[i];
//            var feature = {};
//            feature.type = "Feature";
//            feature.id = atm.id;
//
//            var properties = {};
//            feature.properties = properties;
//            properties.terminalId = atm.terminalId;
//            properties.macAddress = atm.macAddress;
//            properties.status = atm.status;
//            properties.topper = atm.topper;
//
//            var geometry = {};
//            geometry.type = atm.geometry.type;
//            geometry.coordinates = atm.geometry.coordinates;
//            feature.geometry = geometry;
//            geometry.coordinates.push(0.0);
//            fc.features.push(feature);
//          }
//          res.json(fc);
//        }
//      );
//    }
      
  },

  'kioskInService' : function(req, res) {
      
    sails.log.info("Calling kioskInService");
    var fc = {};
    fc.type = "FeatureCollection";
    var metadata = {};
    fc.metadata = metadata;
    metadata.generated = 1363529248000;
    metadata.url = "http://www.kombicorp.com";
    metadata.title = "Kombi Kiosk ATM Locations";
    metadata.subTitle = "Real-time, Kombi Kiosk location information";
    metadata.cacheMaxAge = "900";
    fc.features = [];
    res.json(fc);
      
//    var filter = { DISCRIMINATOR : 'ATM', geometry : { $exists : true }, service : { $exists : true }};
//    var atmList = [];
//    sails.log.info("kioskListPaged filter : "+JSON.stringify(filter));
//    dbclient.db().neocard.collection('poi').find( filter, {terminalId:1, macAddress :1 , geometry:1, topper:1, status:1 }).toArray(
//      function(err, results) {
//        if (err) {
//          sails.log.error(err);
//        }
//        sails.log.debug("query found : " + results.length);
//        var fc = {};
//        fc.type = "FeatureCollection";
//        var metadata = {};
//        fc.metadata = metadata;
//        metadata.generated = 1363529248000;
//        metadata.url = "http://www.kombicorp.com";
//        metadata.title = "Kombi Kiosk ATM Locations";
//        metadata.subTitle = "Real-time, Kombi Kiosk location information";
//        metadata.cacheMaxAge = "900";
//        fc.features = [];
//        for (var i = 0; i < results.length; i++) {
//          var atm = results[i];
//          var feature = {};
//          feature.type = "Feature";
//          feature.id = atm.id;
//
//          var properties = {};
//          feature.properties = properties;
//          properties.terminalId = atm.terminalId;
//          properties.macAddress = atm.macAddress;
//          properties.status = atm.status;
//          properties.topper = atm.topper;
//
//          var geometry = {};
//          geometry.type = atm.geometry.type;
//          geometry.coordinates = atm.geometry.coordinates;
//          feature.geometry = geometry;
//          geometry.coordinates.push(0.0);
//          fc.features.push(feature);
//        }
//        res.json(fc);
//      }
//    );
  },

  'total' : function(req, res) {
    //var alltmOnly = req.param("alltmOnly", "false");
    var count = 0;
    sails.log.info('count() returning : '+count);
    res.json({'count': count});
      
//    var filter = { DISCRIMINATOR : 'ATM', geometry : { $exists : true }, service : { $exists : false }};
//    //if (alltmOnly === "true") {
//    //  var filter ={ DISCRIMINATOR : 'ATM', geometry : { $exists : true }, 'service.currentStatus' : 'active' };
//    //  sails.log.debug ("Filtering by alltmOnly");
//    //}
//    //sails.log.info("total filter : "+filter);
//    dbclient.db().neocard.collection('poi').find( filter).count(function (e, count) {
//      if (e) {
//        sails.log.error('alltm/total error, returning : 0 '+err);
//        res.json({'count': 0 });
//      } else {
//        sails.log.info('count() returning : '+count);
//        res.json({'count': count});
//      }
//    });
  },

  'changeStatus' : function(req, res) {
      sails.log.info("Calling changeStatus - Not Implemented.");
//      sails.log.info("Calling changeStatus");
//      
//      var terminalId = req.param('tid');
//      var active = req.param('status');
//      dbclient.db().neocard.collection('poi').update(
//          { terminalId : $terminalId},
//          { $set: { 'service.currentStatus': $status } }
//      );
  },

    //'changeProduction' : function(req, res) {
    //    sails.log.info("Calling changeProduction");
    //    var terminalId = req.param('tid');
    //    var prod = req.param('prod');
    //    dbclient.db().neocard.collection('poi').update(
    //        { terminalId : terminalId},
    //        { $set: { 'service.isProduction': prod } },
    //  {w:0});
    //},

    //'isProduction' : function(req, res) {
    //  sails.log.info("Calling changeProduction");
    //
    //  var terminalId = req.param("terminalId");
    //  dbclient.db().neocard.collection('poi').findOne({ DISCRIMINATOR : 'ATM', terminalId : terminalId }, function(err, term) {
    //    sails.log.debug('isProduction found : '+ term.terminalId);
    //    var result = {};
    //    result.isProduction = term.service.isProduction;
    //    // Send a JSON response
    //    res.json(result);
    //  });
    //},

  'listByHash' : function(req, res) {

        var fc = {};
        fc.type = "FeatureCollection";
        var metadata = {};
        fc.metadata = metadata;
        metadata.generated = 1363529248000;
        metadata.url = "http://www.kombicorp.com/signage";
        metadata.title = "Kombi Signage Locations";
        metadata.subTitle = "Real-time, Cardtronics ATM location information";
        metadata.cacheMaxAge = "900";
        fc.features = [];
        res.json(fc);
//        var hash = req.param("hash");
//
//      
//        var alltmOnly = req.param("alltmOnly", "true");
//        var filter ={ DISCRIMINATOR : 'ATM', geohash : { $regex: '^'+hash, $options: 'i' } };
//        if (alltmOnly === "true") {
//            var filter ={ DISCRIMINATOR : 'ATM', geohash : { $regex: '^'+hash, $options: 'i' }, 'service.isProduction' : true };
//            sails.log.debug ("Filtering by alltmOnly");
//        }
//        sails.log.info('running ... /listByHash: '+hash + ' alltmOnly: '+alltmOnly);
//        var atmList = [];
//        // Locate all the entries using find
//        dbclient.db().neocard.collection('poi').find( filter,
//                                         {terminalId:1, macAddress :1 , geometry:1, topper:1, status:1 }).toArray(function(err, results) {
//            if (err) {
//                sails.log.error(err);
//            }
//            sails.log.debug("query found : "+results.length);
//            var fc = {};
//            fc.type = "FeatureCollection";
//            var metadata = {};
//            fc.metadata = metadata;
//            metadata.generated = 1363529248000;
//            metadata.url = "http://www.kombicorp.com/cardtronics";
//            metadata.title = "Cardtronics ATM Locations";
//            metadata.subTitle = "Real-time, Cardtronics ATM location information";
//            metadata.cacheMaxAge = "900";
//            fc.features = [];
//            for (var i=0; i < results.length; i++) {
//                var atm = results[i];
//                var feature = {};
//                feature.type ="Feature";
//                feature.id = atm.id;
//
//                var properties = {};
//                feature.properties = properties;
//                properties.terminalId = atm.terminalId;
//                properties.macAddress = atm.macAddress;
//                properties.status = atm.status;
//                properties.topper = atm.topper;
//
//                var geometry = {};
//                geometry.type = atm.geometry.type;
//                geometry.coordinates = atm.geometry.coordinates;
//                feature.geometry = geometry;
//                geometry.coordinates.push(0.0);
//                fc.features.push(feature);
//            }
//            res.json(fc);
//
//        });
    },

/**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ReportController)
   */
  _config: {}


};
