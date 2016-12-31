/**
 * UserMetricsController
 *
 * @module      :: Controller
 * @description	:: Reports User Metrics 
 *
 *
 * @docs        :: 
 */
module.exports = {

    /**
     * Returns User metrics, filtered by date. Defaults to last 7 days.
     */
    metrics: function (req, res) {
        var metrics = {};
        
        var dateRange = req.param("dateRange");
		var dates = modelhelper.convertDateRange(dateRange, "days", 7);
        
        // Call these in parallel --
        // TODO these could be grouped and counted in a single query using the aggregation framework.
        async.parallel({
            one: function(callback) {
                dbclient.db().ks.collection('userevent').count({type: eventtype.types().accountCreateEvent, time: {$gte : dates.start, $lte : dates.end }},
                    function (err, count) {
                        if (err) { sails.log.debug(err); }
                        callback(null, count);
                    }
                );
            },
            two: function(callback) {
                dbclient.db().ks.collection('userevent').count({type: eventtype.types().accountDeleteEvent, time: {$gte : dates.start, $lte : dates.end }},
                    function (err, count) {
                        if (err) { sails.log.debug(err); }
                        callback(null, count);
                    }
                );
            },
            three: function(callback) {
                dbclient.db().ks.collection('userevent').count({type: eventtype.types().checkinEvent, time: {$gte : dates.start, $lte : dates.end }},
                    function (err, count) {
                        if (err) { sails.log.debug(err); }
                        callback(null, count);
                    }
                );
            },
            four: function(callback) {
                dbclient.db().ks.collection('userevent').count({type: eventtype.types().checkoutEvent, time: {$gte : dates.start, $lte : dates.end }},
                    function (err, count) {
                        if (err) { sails.log.debug(err); }
                        callback(null, count);
                    }
                );
            },
            five: function(callback) {
                dbclient.db().ks.collection('userevent').count({type: eventtype.types().redeemCouponEvent, time: {$gte : dates.start, $lte : dates.end }},
                    function (err, count) {
                        if (err) { sails.log.debug(err); }
                        callback(null, count);
                    }
                );
            },
            six: function(callback) {
                dbclient.db().ks.collection('userevent').count({type: eventtype.types().activateCouponEvent, time: {$gte : dates.start, $lte : dates.end }},
                    function (err, count) {
                        if (err) { sails.log.debug(err); }
                        callback(null, count);
                    }
                );
            },
            seven: function(callback) {
                dbclient.db().ks.collection('userevent').count({type: eventtype.types().addCouponEvent, time: {$gte : dates.start, $lte : dates.end }},
                    function (err, count) {
                        if (err) { sails.log.debug(err); }
                        callback(null, count);
                    }
                );
            }
        }, function (err, results) {
            // combine results into one object
            var added = results.one;
            var deleted = results.two;
            metrics.activeUserAccounts = (added - deleted);
            metrics.createdUserAccounts = added;
            metrics.deletedUserAccounts = deleted;
            metrics.checkins = results.three;
            metrics.checkouts = results.four;
            metrics.redeem = results.five;
            metrics.activateCoupons = results.six;
            metrics.addCoupons = results.seven;
            sails.log.debug("metrics: " +JSON.stringify(metrics) );
            res.json(metrics);
        });


    },
/**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ReportController)
   */
  _config: {}

  
};
