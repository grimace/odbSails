/**
 * Created by chuckf on 5/8/14.
 */

var moment = require('moment');
// export this to sails
module.exports =  {
    
    /**
     * Summary
     * @param	{Object}	date	Description
     * @returns	{Object}			Description
     */
    moment: function( date ) {
        return moment(date);
    },
    
    /**
     * Formats a Date with a default pattern - 'MM/DD/YY, h:mm:ss a'
     * @param	{Object}	date	Description
     * @returns	{Object}			String representation of the Date
     */
    defaultFormatDate: function(date) {
        return moment(date).format('MM/DD/YY, h:mm:ss a');
    },
    
    /**
     * Formats a date object based on the supplied pattern
     * @param	{Object}	date	Description
     * @param	{Object}	pattern	Description
     * @returns	{Object}			String representation of the Date
     */
    formatDate: function(date, pattern) {
        if (date == null || pattern == null) {
            return "";
        }
        return moment(date).format(pattern);
    },
    
    /**
     * Given a date as String, returns a Javascript Date Object.
     * @param	{Object}	dateStr	assumes "MM/DD/YYYY" format
     * @returns	{Object}			a Javascript Date Object
     */
    parseDate: function(dateStr) {
        return moment.utc(dateStr, "MM/DD/YYYY").toDate();
    },

    /**
     * Given a date, returns the time difference between them in minutes. 
     * @returns	{Object}			Description
     */
    timeDiff: function(base, outDate) {
        if (!base) {
            base = new Date();
        }
        if (outDate === undefined) {
            return -1;
        }
        return moment(base).diff( outDate, 'minutes');
    },
    
    /**
     * Takes a Java Date and returns a Date with the hour/min/sec set to the end of the day
     * ie 23:59:59 -- does not take into account timezone
     */
    makeEndOfDay: function(date) {
        if (!date) {
            date = new Date();
        }
        return moment.utc(date).set('hour', 23).set('minute', 59).set('second', 59).toDate();
    }

}
