/**
 * Created by chuckf on 5/8/14.
 * Currently uses the Sails actionUtil function to return the Req params as an object.
 * This includes params that may not be wanted in the Model. Use with caution.
 * @see sails/lib/hooks/blueprints/action/update.js for example usage.
 */


var util = require('sails/lib/hooks/blueprints/actionUtil');
var stringutil = require('./stringutil');
var dateutil = require('./dateutil');

// export this to sails
exports.parse = function( req ) {
    // Calls code in Sails blueprints.
    return util.parseValues(req);
},

/**
 * Converts a standard req.param("dateRange") string into a start and end date.
 * If the dateRange is not supplied, it will default to dates.start date based on
 * StartBasis/startIncrement dates.end = now.
 * 
 * @param	{Object}	dateRange			Description
 * @param	{Object}	startBasis			used to configure start date ("hours", "minutes", "days")
 * @param	{Object}	startIncrement	    Increment amount for startBasis
 * @returns	{Object}						returns a { start: StartDate, end: EndDate }; where Dates are Javascript Date Objects
 */
exports.convertDateRange = function(dateRange, startBasis, startIncrement) {
    var util = stringutil.util;
    var d = {};
    if (dateRange) {
        // parse values
        var dates = util.parseDateRange(dateRange);
        d.start = dateutil.parseDate(dates.start);
        d.end = dateutil.parseDate(dates.end);
    } else {
        // default to passed in defaults
        d.start = dateutil.moment(new Date).subtract(startBasis, startIncrement).toDate();
        d.end = new Date();
    }
    return d; 
},

/**
 * Converts the Proof of play data into usable string format for Chart display.
 * @param	{Object}	results	Description
 * @returns	{Object}			Description
 */
exports.convertProofOfPlay = function( results ) {
    var assocArray = {};
    var list = [];
    if (results === undefined || results == null) {
        return list;
    }
    // map this data to usable format
    var data = results.map(function(element, index, array) {
        var item = { };
        var mediaName = element._id.mediaName;
        if (mediaName == null ) {
            item.group = "N/A"
            item.media = "N/A"
        } else if (mediaName.indexOf("file") === 0) {
            item.group = 'Ticker';
            item.media = 'Brand';
        } else if (mediaName.indexOf('http') === 0) {
            item.group = 'Ticker';
            item.media = 'Weather';
        } else {
            var strArray = element._id.mediaName.split("/");
            if (strArray.length > 2) {
                item.group = strArray[strArray.length - 2];
            }
            if (strArray.length > 1) {
                item.media = strArray[strArray.length - 1];
            } else {
                item.media = strArray[0];
            }
            
        }
        if (assocArray[item.media]) {
            assocArray[item.media].count += element.count;
        } else {
            assocArray[item.media] = {};
            assocArray[item.media].group = item.group;
            assocArray[item.media].media = item.media;
            assocArray[item.media].count = element.count;
        }

        item.count = element.count;
        return item;
    });
    // convert back to Array.
    var keylist = Object.getOwnPropertyNames(assocArray);
    for (var i=0; i < keylist.length; i++ ) {
        var key = keylist[i];
        var value = assocArray[key];
        list.push(value);
    }
    return list;
}
