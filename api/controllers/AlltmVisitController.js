/**
 * ReportController
 *
 * @module      :: Controller
 * @description    :: A set of functions called `actions`.
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
var moment = require('moment');
var cacheManager = require('cache-manager');
var memoryCache = cacheManager.caching({store: 'memory', max: 100, ttl: (300) /*seconds == 5 minutes*/});

module.exports = {

  /**
   * Action blueprints:
   *    `/report/index`
   *    `/report`
   */
  // Camera data: visits per Kiosk.
  visitsByAlltm: function (req, res) {
    var macAddress = req.param("mac");
    // Send a JSON response
    var cacheKey = 'visitAlltm_' + macAddress;
    memoryCache.wrap(cacheKey, function (cacheCb) {
      console.log("Fetching VisitByAlltm from DB");
      visitByAlltm_dbcall(macAddress, cacheCb);
    }, respondJson(res));

  },
  /**
   * Returns all visits for production Kiosk's filtered by date
   */
  visitPerDay: function (req, res) {
    var dateRange = req.param("dateRange");
    var dates = modelhelper.convertDateRange(dateRange, 'days', 14);

    var cacheKey = 'visitPerDay_' + dates.start.toDateString() + '_' + (dates.end ? dates.end.toDateString() : '');
    sails.log.info('VisitPerDay -- cacheKey: ' + cacheKey);
    memoryCache.wrap(cacheKey, function (cacheCb) {
      visitPerDay_dbcall(dates, cacheCb);
    }, respondJson(res));

  },

  /**
   * Camera data: visit totals (By Age) across the network for
   *              production Kiosk's filtered by date
   */
  visitsByAge: function (req, res) {

    var dateRange = req.param("dateRange");
    var dates;
    if (dateRange) {
      dates = modelhelper.convertDateRange(dateRange);
    }
    var vaCacheKey = 'visitByAge_' + (dateRange ? dateRange : 'all');
    sails.log.info('VisitByAge cacheKey: ' + vaCacheKey);
    memoryCache.wrap(vaCacheKey, function (cacheCb) {
      visitsByAge_dbcall(dates, cacheCb);
    }, respondJson(res));

  },

  /**
   * Returns the avg visit duration, grouped by gender for production Kiosk's filtered by date
   */
  visitAvgDuration: function (req, res) {
    var dateRange = req.param("dateRange");
    var dates;
    if (dateRange) {
      dates = modelhelper.convertDateRange(dateRange);
    }

    var cacheKey = 'visitAvgDuration_' + (dateRange ? dateRange : 'all');
    sails.log.debug('VisitAvgDuration Cache Key:' + cacheKey);
    memoryCache.wrap(cacheKey, function (cacheCb) {
      visitAvgDuration_dbcall(dates, cacheCb);
    }, respondJson(res));

  },

  /**
   * Camera data: visit totals (By Gender) across the network for
   *              production Kiosk's filtered by date
   */
  visitsByNetwork: function (req, res) {

    var dateRange = req.param("dateRange");
    var dates;
    if (dateRange) {
      dates = modelhelper.convertDateRange(dateRange);
    }
    var vbnCacheKey = 'visitByNetwork_' + (dateRange ? dateRange : 'all');
    sails.log.info('VisitByNetwork cacheKey: ' + vbnCacheKey);
    memoryCache.wrap(vbnCacheKey, function (cacheCb) {
      visitsByNetwork_dbcall(dates, cacheCb);
    }, respondJson(res));

  },


  alltmMetrics: function (req, res) {

    var macAddress = req.param("mac");
    if (macAddress == null || macAddress == "") {
      res.json({});
    }

    var cacheKey = 'alltmMetrics' + macAddress;
    sails.log.info('alltmMetrics cacheKey: ' + cacheKey);
    memoryCache.wrap(cacheKey, function (cacheCb) {
      alltmMetrics_dbcall(macAddress, cacheCb);
    }, respondJson(res));

  },
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ReportController)
   */
  _config: {}

};

/**
 * Renders a JSON response
 */
function respondJson(res) {
  return function respond(err, data) {
    if (err) {
      sails.log.error(err);
      res.json(500, new MessageResponse(false, "Could not load Data"));
    } else {
      res.json(data);
    }
  };
}

/**
 * Fetches Visit information from DB.
 */
function visitByAlltm_dbcall(macAddress, cb) {

  var gender = {};
  var unknown = 0;
  var male = 0;
  var female = 0;
  var total = 0;
  var group = 0;
  var atmList = [];
    gender.unknown = unknown;
    gender.female = female;
    gender.male = male;
    gender.group = group;
    gender.total = total;
    return cb(null, gender);

//  dbclient.db().ks.collection('rollup').find({ className: 'com.kmb.domain.analytics.DayVisitRollup', macAddress: macAddress })
//    .toArray(function (err, results) {
//      if (err) return cb(err);
//      total = results.length;
//      //sails.log.debug( 'visitsByAlltm found : ' + total );
//      for (var i = 0; i < results.length; i++) {
//        var visit = results[i];
//        var rollup = visit.rollup;
//        unknown += rollup.unknownGenderCount;
//        female += rollup.femaleCount;
//        male += rollup.maleCount;
//        group += rollup.groupCount;
//        total += rollup.allCount;
//
//      }
//      gender.unknown = unknown;
//      gender.female = female;
//      gender.male = male;
//      gender.group = group;
//      gender.total = total;
//      return cb(null, gender);
//    });
}

/**
 * gets visits per day for a specified amount of time.
 */
function visitPerDay_dbcall(dates, cb) {

    var data = [];
    return cb(null, data);

//  var dateFunc = function (visit) {
//    return {start: visit.start.toDateString()}
//  };
//  Kiosk.findProduction(function (err, kiosks) {
//    if (err) {
//      sails.log.debug(err);
//      return cb(err);
//    }
//    var macAddresses = kiosks.map(function (item) {
//      return item.macAddress;
//    });
//
//    //var matchQuery = { DISCRIMINATOR: 'Visit', macAddress: {$in : macAddresses}  };
//    var matchQuery = { className: 'com.kmb.domain.analytics.DayVisitRollup', macAddress: { $in: macAddresses}};
//    if (dates && dates.end) {
//      matchQuery.day = {$gte: dates.start, $lte: dates.end};
//    } else if (dates && dates.start) {
//      matchQuery.day = {$gte: dates.start};
//    }
//    sails.log.debug('visitPerDay Match Query:' + JSON.stringify(matchQuery));
//
//    dbclient.db().ks.collection('rollup'). //.group( dateFunc,
//      aggregate([
//        {$match: matchQuery},
//        {
//          $project: {
//            year: {$year: "$day"},
//            month: {$month: "$day"},
//            dom: {$dayOfMonth: "$day"},
//            ac: "$rollup.allCount"
//          }
//        },
//        {
//          $group: {
//            _id: {year: "$year", month: "$month", day: "$dom"},
//            count: {$sum: "$ac"}
//          }
//        },
//        {$sort: {"_id.year": 1, "_id.month": 1, "_id.day": 1}}],
//      function (err, results) {
//        if (err) return cb(err);
//        // Convert to expected format
//        //sails.log.debug('VisitPerDay====='+JSON.stringify(results));
//        sails.log.debug('VisitPerDay=====' + results.length);
//        var data = [];
//        for (var i = 0; i < results.length; i++) {
//          if (i % 10 == 10) {
//            sails.log.debug('VisitPerDay, result ==' + results[i]);
//          }
//          var row = {};
//          row.start = results[i]._id.month + "/" + results[i]._id.day + "/" + results[i]._id.year;
//          row.visit = results[i].count;
//          data.push(row);
//        }
//
//        return cb(null, data);
//      });
//  });

}

/**
 * Get avg visit duration overall
 */
function visitAvgDuration_dbcall(dates, cb) {

  var gender = [];
  var unknown = [];
  var unknownCount = [];
  var male = [];
  var maleCount = [];
  var female = [];
  var femaleCount = [];
  var group = [];
  var groupCount = [];
  var baseArray = [];
  baseArray.push(['unknown', unknown]);
  baseArray.push(['female', female]);
  baseArray.push(['male', male]);
  //sails.log.debug("unknown : " + group + " , groupCount : " + groupCount);
  baseArray.push(['group', group]);
  sails.log.debug("AvgDuration baseArray: " + JSON.stringify(baseArray));

      // Send a JSON response
  return cb(null, baseArray);

//    
//    
//  var value = 0.0;
//
//  var avgFuncNu = function (list, listCount) {
//    if (list == null || list.length == 0) {
//      return 0;
//    }
//    if (list.length == 1) {
//      return list[0].toFixed(2);
//    }
//
//    var sum = 0;
//    var count = 0;
//    for (i = 0; i < list.length; i++) {
//      sum = sum + parseFloat(list[i]);
//    }
//    for (i = 0; i < listCount.length; i++) {
//      count = count + parseFloat(listCount[i]);
//    }
//
//    var avg = (sum / count);
//    return avg.toFixed(2);
//  }
//
//  var avgFunc = function (list) {
//    if (list == null || list.length == 0) {
//      return 0;
//    }
//    if (list.length == 1) {
//      return list[0].toFixed(2);
//    }
//
//    var sum = 0;
//    for (i = 0; i < list.length; i++) {
//      sum = sum + parseFloat(list[i]);
//    }
//    var avg = (sum / list.length);
//    return avg.toFixed(2);
//  }
//
//  Kiosk.findProduction(function (err, kiosks) {
//
//    if (err) return cb(err);
//
//    var macAddresses = kiosks.map(
//      function (item) {
//        if (item.macAddress != null) {
//
//          return item.macAddress;
//        }
//      }
//    );
//    // build the match query
//    var rec;
//    var matchQuery = { className: 'com.kmb.domain.analytics.DayVisitRollup', macAddress: {$in: macAddresses}};
//    if (dates) {
//      matchQuery.day = {$gte: dates.start, $lte: dates.end};
//    }
//    sails.log.debug("AvgDuration Match: " + JSON.stringify(matchQuery));
//    dbclient.db().ks.collection('rollup').find(matchQuery).toArray(function (err, results) {
//      if (err) return cb(err);
//      total = results.length;
//      //sails.log.debug( 'visitsByAlltm found : ' + total );
//      for (var i = 0; i < results.length; i++) {
//
//        var visit = results[i];
//        var rollup = visit.rollup;
//
//        value = rollup.groupTotal;
//        if (value != 0) {
//          group.push(rollup.groupTotal);
//          groupCount.push(rollup.groupCount);
//        }
//
//        value = rollup.maleTotal;
//        if (value != 0) {
//          male.push(rollup.maleTotal);
//          maleCount.push(rollup.maleCount);
//        }
//
//        value = rollup.femaleTotal;
//        if (value != 0) {
//          female.push(rollup.femaleTotal);
//          femaleCount.push(rollup.femaleCount);
//        }
//
//        value = rollup.unknownGenderTotal;
//        if (value != 0) {
//          unknown.push(rollup.unknownGenderTotal);
//          unknownCount.push(rollup.unknownGenderCount);
//        }
//      }
//
//      var baseArray = [];
//      baseArray.push(['unknown', avgFuncNu(unknown, unknownCount)]);
//      baseArray.push(['female', avgFuncNu(female, femaleCount)]);
//      baseArray.push(['male', avgFuncNu(male, maleCount)]);
//      //sails.log.debug("unknown : " + group + " , groupCount : " + groupCount);
//      baseArray.push(['group', avgFuncNu(group, groupCount)]);
//      sails.log.debug("AvgDuration baseArray: " + JSON.stringify(baseArray));
//
//      // Send a JSON response
//      return cb(null, baseArray);
//    });
//
//  });
}

/**
 * get Visit Information 'AlltmVisits By Gender'
 */
function visitsByNetwork_dbcall(dates, cb) {

  sails.log.debug("VisitsByNetwork " + JSON.stringify(dates));
  var gender = [];
  var total = 0;
  var unknown = 0;
  var male = 0;
  var female = 0;
  var group = 0;
  baseArray.push(['unknown', unknown]);
  baseArray.push(['female', female]);
  baseArray.push(['male', male]);
  //sails.log.debug("unknown : " + group + " , groupCount : " + groupCount);
  baseArray.push(['group', group]);
  sails.log.debug("VisitsByNetwork baseArray: " + JSON.stringify(baseArray));

      // Send a JSON response
  return cb(null, baseArray);

//    
//  Kiosk.findProduction(function (err, kiosks) {
//    if (err) {
//      sails.log.debug(" error1 visitsByNetwork " + err);
//      return cb(err);
//    }
//    var macAddresses = kiosks.map(function (item) {
//      //if (item.macAddress != null) {
//      return item.macAddress;
//      //}
//    });
//    //var matchQuery = { DISCRIMINATOR: 'Visit', macAddress: {$in : macAddresses}  };
//    //var matchQuery = {macAddress: {$in: macAddresses}};
//    var matchQuery = { className: 'com.kmb.domain.analytics.DayVisitRollup', macAddress: {$in : macAddresses}  };
//    if (dates) {
//      matchQuery.day = {$gte: dates.start, $lte: dates.end};
//    }
//    sails.log.debug("VisitByNetwork Match: " + JSON.stringify(matchQuery));
//
//    dbclient.db().ks.collection('rollup').aggregate([
//        {$match: matchQuery},
//        {$group: {_id: '$rollup', count: {$sum: '$rollup.allCount'}}}
//        //{ $group: { _id: '$visitType', count: { $sum: 1 } } }
//      ],
//      function (err, results) {
//        if (err) {
//          sails.log.debug(" error2 visitsByNetwork " + err);
//          return cb(err);
//        }
//        sails.log.debug('visitNetwork query returned : ' + results.length);
//        total = results.length;
//        for (var i = 0; i < results.length; i++) {
//          var visit = results[i];
//          var rollup = visit._id;
//          total += rollup.allCount;
//          group += rollup.groupCount;
//          male += rollup.maleCount;
//          female += rollup.femaleCount;
//          unknown += rollup.unknownGenderCount;
//
//        }
//
//        var baseArray = [];
//        baseArray.push(['unknown', unknown]);
//        baseArray.push(['female', female]);
//        baseArray.push(['male', male]);
//        baseArray.push(['group', group]);
//        sails.log.debug('visitByNetwork returning : ' + JSON.stringify(baseArray));
//        return cb(null, baseArray);
//      });
//  });
}

/**
 * get Visit Information 'AlltmVisits By Age'
 */
function visitsByAge_dbcall(dates, cb) {

  sails.log.debug("VisitsByAge " + JSON.stringify(dates));
  var age = [];
  //var ageTotal = 0;
  var unknownAge = 0;
  var child = 0;
  var youth = 0;
  var adult = 0;
  var senior = 0;

    var baseArray = [];
    //baseArray.push( ['total', ageTotal] );
    baseArray.push(['unknown', unknownAge]);
    baseArray.push(['child', child]);
    baseArray.push(['youth', youth]);
    baseArray.push(['adult', adult]);
    baseArray.push(['senior', senior]);
    sails.log.debug('visitByAge returning : ' + JSON.stringify(baseArray));
    return cb(null, baseArray);

//  Kiosk.findProduction(function (err, kiosks) {
//    if (err) {
//      sails.log.debug(" error1 visitsByAge " + err);
//      return cb(err);
//    }
//    var macAddresses = kiosks.map(function (item) {
//      //if (item.macAddress != null) {
//      return item.macAddress;
//      //}
//    });
//    var matchQuery = { className: 'com.kmb.domain.analytics.DayVisitRollup', macAddress: {$in : macAddresses}  };
//    if (dates) {
//      matchQuery.day = {$gte: dates.start, $lte: dates.end};
//    }
//    sails.log.debug("VisitsByAge Match: " + JSON.stringify(matchQuery));
//
//    dbclient.db().ks.collection('rollup').aggregate([
//        {$match: matchQuery},
//        {$group: {_id: '$rollup', count: {$sum: '$rollup.allCount'}}}
//        //{ $group: { _id: '$visitType', count: { $sum: 1 } } }
//      ],
//      function (err, results) {
//        if (err) {
//          sails.log.debug(" error2 VisitsByAge " + err);
//          return cb(err);
//        }
//        sails.log.debug('VisitsByAge query returned : ' + results.length);
//        for (var i = 0; i < results.length; i++) {
//          var visit = results[i];
//          var rollup = visit._id;
//          //ageTotal += rollup.allCount;
//          child += rollup.childCount;
//          youth += rollup.youthCount;
//          adult += rollup.adultCount;
//          senior += rollup.seniorCount;
//          unknownAge += rollup.unknownAgeCount;
//
//        }
//        //sails.log("visitNetwork , results :"+results);
//        //var visit = results[0];
//        //var rollup = visit._id;
//        var baseArray = [];
//        //baseArray.push( ['total', ageTotal] );
//        baseArray.push(['unknown', unknownAge]);
//        baseArray.push(['child', child]);
//        baseArray.push(['youth', youth]);
//        baseArray.push(['adult', adult]);
//        baseArray.push(['senior', senior]);
//        sails.log.debug('visitByAge returning : ' + JSON.stringify(baseArray));
//        return cb(null, baseArray);
//      });
//  });
}

function alltmMetrics_dbcall(macAddress, cb) {
  // Initially look up Id, then get associated metrics
  var metrics = {};
  metrics.checkins = 0;
  metrics.coupons = 0;
  metrics.uniqueUsers = 0;
  return cb(null, metrics);

//  var alltmId;
//  dbclient.db().neocard.collection('poi').findOne({DISCRIMINATOR: 'ATM', macAddress: macAddress},
//    function (err, doc) {
//      if (err) return cb(err);
//      alltmId = doc.id;
//      var timediff = dateutil.timeDiff(new Date(), doc.lastCheckIn);
//      if (timediff === 0) {
//        metrics.lastCheckIn = "> 1 min ago";
//      } else if (timediff === -1) {
//        metrics.lastCheckIn = "Not available";
//      } else {
//        metrics.lastCheckIn = timediff + " min(S) ago";
//      }
//      async.parallel({
//          a: function (callback) {
//            dbclient.db().ks.collection('userevent').count({type: eventtype.types().checkinEvent, atmId: alltmId},
//              function (err, count) {
//                if (err) {
//                  sails.log.debug(err);
//                }
//                return callback(null, count);
//              });
//          },
//          b: function (callback) {
//            dbclient.db().ks.collection('userevent').count({type: eventtype.types().redeemCouponEvent, atmId: alltmId},
//              function (err, count) {
//                if (err) {
//                  sails.log.debug(err);
//                }
//                return callback(null, count);
//              });
//          },
//          c: function (callback) {
//            dbclient.db().ks.collection('userevent').distinct('uId', {atmId: alltmId},
//              function (err, docs) {
//                if (err) {
//                  sails.log.debug(err);
//                }
//                return callback(null, docs.length);
//              });
//          }
//        },
//        function (err, results) {
//          metrics.checkins = results.a;
//          metrics.coupons = results.b;
//          metrics.uniqueUsers = results.c;
//          return cb(null, metrics);
//        });
//    });
}
