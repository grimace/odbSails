/**
 * ProofOfPlayController
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

    logRequest: function(req, res) {
        var user = req.user;
        var dateRange = req.param("dateRange");
        var dateRangeStr = "";
        if (dateRange) {
            dateRangeStr = " - Requested Log dates are : " + dateRange;
        }
		// Send as AWS SNS call
        var msg = {};
		msg.TopicArn = sails.config.topic;
		msg.Subject = "Proof-Of-Play Log Request";
		msg.Message = user.firstName + " "+ user.lastName + " (" + user.email +
                      ") requested a Proof-Of-Play Log on " + dateutil.defaultFormatDate(new Date()) + dateRangeStr;
        sails.log.debug(JSON.stringify(msg));
        // Send Notification
		var sns = new aws.SNS();
		sns.publish(msg, function(err, data) {
			if (err) {
				res.json(new MessageResponse(false, "Error sending Message"));
			} else  {
				res.json(new MessageResponse(true));
			}
		});
    },
    
	popCount: function(req, res) {
        
        var dateRange = req.param("dateRange");
        if (!dateRange) {
            res.json(new MessageResponse(false, "Date Range is required"));
        }
        var util = stringutil.util;
        // parse values
        var dates = util.parseDateRange(dateRange);
        var start = dateutil.parseDate(dates.start);
        var end = dateutil.parseDate(dates.end);
        sails.log.debug("Use Dates : " + start + ", " + end);
        
		Kiosk.findProduction(function(err, kiosks) {
			if (err) {
				sails.log.debug(err);
				res.json(new MessageResponse(false, "Could not load play count"));
			}
			var macAddresses = kiosks.map(function(item) {
					return item.macAddress;
				});		
			//sails.log.info("Filtering ("+macAddresses.length+")by macAddresses: " + macAddresses);
			dbclient.db().ks.collection( 'report' ).aggregate( [
					{ $match: {DISCRIMINATOR: 'POP', start :  { $gte: start, $lt : end }, macAddress: {$in : macAddresses} }},
					{ $group : {
						_id : {mediaName : '$mediaName'}, 
						count : {$sum : 1}
					}} 
				],
				function ( err, results ) {
					if (err) {
						sails.log.debug(err);
						res.json(new MessageResponse(false, "Could not load play count"));
					}
					var list = modelhelper.convertProofOfPlay(results);
					res.json(list);
				}
			);
		});
	},
	
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ProofOfPlayController)
   */
    _config: {

    }

};
