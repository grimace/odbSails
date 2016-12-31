/**
 * Created by chuckf on 5/8/14.
 *
 * Service to work with Amazon s3
 */


// export this to sails
exports.util =  {

    splitKey : function( key ) {
        var keys = key.split('|');
        var pair = {}
        pair.id  = keys[0];
        pair.name = keys[1];
        return pair;
    },
    /**
     * Strips any money formating characters from the string
     * 
     * @param	{Object}	str	Description
     * @returns	{string}		without any characters except Numerical, - and .
     */
    stripCurrency : function( str ) {
        if (str) {
            return str.replace(/[^0-9-.]/g, '');
        }
        return "";
    },
    
    /**
     * Parses a concatenated date string by '-' into a date object with a
     * start and end date. { start : XXXX, end : XXXX }
     */
    parseDateRange: function( dateRange ) {
        if (dateRange) {
            var ranges = dateRange.split('-');
            var dates = {};
            if (ranges.length == 2) {
                dates.start = ranges[0];
                dates.end = ranges[1];
            } else {
                dates.start = ranges[0];
            }
            return dates;
        }
        return "";
    },
    
    parseKeyArray: function ( dest, keys ) {
        if ( keys != null ) {
            if (Array.isArray(keys)) {
                for (var i=0; i < keys.length; i++ ) {
                    var key = this.splitKey(keys[i]);
                    dest.push(key);
                }
            } else {
                var key = this.splitKey(keys);
                dest.push(key);
            }
        }
        return dest;
    },
    
    /**
     * formats a string as currency, adding the prefix if specified. 
     * params (1000, '$') would result in $1,000.00
     */
    formatCurrency: function ( currency, prefix ) {
        // Create our number formatter.
        var formatMoney = function(n, c, d, t){
            c = isNaN(c = Math.abs(c)) ? 2 : c, 
            d = d == undefined ? "." : d, 
            t = t == undefined ? "," : t, 
            s = n < 0 ? "-" : "", 
            i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
            j = (j = i.length) > 3 ? j % 3 : 0;
            return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
        };
        var c = formatMoney(currency);
        if (prefix) {
            return prefix + c;
        }
        return c;
    }

}
