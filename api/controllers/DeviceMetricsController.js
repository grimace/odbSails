/**
 * DeviceMetricController
 *
 * @module      :: Controller
 * @description	:: Reports Device Metrics
 *
 *
 * @docs        ::
 */

//var mongodb = require('dbclient');
module.exports = {

    /**
     * Action blueprints:
     *    `/report/index`
     *    `/report`
     */
    deviceType: function (req, res) {
		var dType = [];
        // Call these in parallel
        var android = {};
        android.label = "Android";
        android.value = 0;
        var ios = {};
        ios.label = "iOS";
        ios.value = 0;
        dType.push(android);
        dType.push(ios);
        sails.log.debug("deviceType: " + JSON.stringify(dType));
        res.json(dType);
//
//        
//        
//        async.parallel({
//            one: function(callback) {
//                dbclient.db().neocard.collection('device').count({phoneType: 'Android'},
//                    function (err, count) {
//                        if (err) { sails.log.debug(err); }
//                        callback(null, count);
//                    }
//                );
//            },
//            two: function(callback) {
//                dbclient.db().neocard.collection('device').count({phoneType: 'iOS'},
//                    function (err, count) {
//                        if (err) { sails.log.debug(err); }
//                        callback(null, count);
//                    }
//                );
//            }
//        }, function (err, results) {
//            // combine results into one object
//            var android = {};
//            android.label = "Android";
//            android.value = results.one;
//            var ios = {};
//            ios.label = "iOS";
//            ios.value = results.two;
//            dType.push(android);
//            dType.push(ios);
//            sails.log.debug("deviceType: " + JSON.stringify(dType));
//            res.json(dType);
//        });
//
    },

    registerCounts: function (req, res) {

        var data = [];
        res.json(data);

//        var dateRange = req.param("dateRange");
//		var dates = modelhelper.convertDateRange(dateRange, "days", 7);
//		var matchQuery = {$match: {time: {$gte : dates.start, $lte : dates.end }, type : 1 }};
//        sails.log.debug('Registration Counts Match Query: ' +  JSON.stringify(matchQuery));
//        
//        dbclient.db().ks.collection('devevent').aggregate([
//            {$match: {time: {$gte : dates.start, $lte : dates.end }, type : 1 }},
//            {$project: {
//                    year:  {$year : "$time"},
//                    month: {$month : "$time"},
//                    day:   {$dayOfMonth : "$time"}
//            }},
//            { $group: {
//                    _id: {year : "$year",month : "$month", day : "$day"},
//                    count: {$sum : 1}
//            }},
//            {$sort: { "_id.year" : 1, "_id.month" :1, "_id.day":1}} ],
//            function(err, results) {
//                if(err) throw err;
//
//                var data = [];
//                for (var i=0; i < results.length; i++) {
//                    var row = [];
//                    row.push( results[i]._id.month + "/" + results[i]._id.day + "/" + results[i]._id.year );
//                    row.push(results[i].count);
//                    data.push(row);
//                }
//
//                //sails.log.info(JSON.stringify(data));
//                // Send a JSON response
//                res.json(data);
//            });

    },
/**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ReportController)
   */
  _config: {}

  
};
