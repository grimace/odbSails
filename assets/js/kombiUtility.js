/**
 *
 * Created by chuckf on 4/10/14.
 */
/**
 * Used to parse query string parameters.
 * Usage:
 *      var param = new QueryStr().params();
 *      var value = q['PARAM-NAME'];
 *
 * @constructor
 */
var QueryStr = function() {

    this.params = function() {
        var vars = [];
        var hash;
        var q = document.URL.split('?')[1];
        if (q != undefined) {
            q = q.split('&');
            for (var i = 0; i < q.length; i++) {
                hash = q[i].split('=');
                vars.push(hash[1]);
                vars[hash[0]] = hash[1];
            }
        }
        return vars;
    }
}

/**
 * Formats a number as a string with ',' markers.
 */
function formatNumber( num, decimals ) {
    if ( typeof num === 'number' ) {
        if (decimals) {
            num = num.toFixed(decimals);
        } else {
            num = num.toFixed();
        }
    }
    return num.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"); 
}

/**
 * Takes a key string array and splits it on the seperator.
 * 111212112|MyTitle
 *
 * returns x.id : 111212112
 *         x.name: MyTitle
 *
 * @param	{Object}	key	Description
 * @returns	{Object}		Description
 */
function splitKey(key) {
    var keys = key.split('|');
    var pair = {}
    pair.id  = keys[0];
    pair.name = keys[1];
    return pair;
}

/**
 * Parses a date string from the date range picker
 * @param	{Object}	dateRange	Description
 * @returns	{Object}				Description
 */
function parseDateRange( dateRange ) {
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
}
    
/**
 * inserts spaces before every uppercase letter that is preceded by a lowercase letter.
 * splitWord("GenderMale") );
 * returns "Gender Male"
 *
 * @param	{Object}	str	Description
 * @returns	{Object}		Description
 */
function splitWord(str) {
    if (str) {
        return str.replace(/([a-z])([A-Z])/g, '$1 $2');
    }
    return "";
}

function formatCurrency( currency, prefix ) {
    // Create our number formatter.
    console.log("Formatting: " + currency);
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
    if (c == 'NaN.N') {
        c = '0.00';
    }
    if (prefix) {
        return prefix + c;
    }
    return c;
}


/** ******************************************* */
/** These Functions are for the Ad/Coupon Pages */

/**
 * Shows ad Modal for
 * @returns	{Object}		Description
 */
function showAdModal() {
    $("#ad_list").modal({
        opacity:80,
        overlayCss: {backgroundColor:"#000"},
        containerCss:{width:"480px", color:"#bbb", backgroundColor:"#fff", border:"none", padding:"0px"},
        overlayClose:true,
        persist:true
    });
}

/**
 * Shows ad Modal for
 * @returns	{Object}		Description
 */
function showCouponModal() {
    $("#coupon_list").modal({
        opacity:80,
        overlayCss: {backgroundColor:"#000"},
        containerCss:{width:"480px", color:"#bbb", backgroundColor:"#fff", border:"none", padding:"0px"},
        overlayClose:true,
        persist:true
    });
}

/**
 * Shows ad Modal for
 * @returns {Object}        Description
 */
function showProductModal() {
    $("#product_list").modal({
        opacity:80,
        overlayCss: {backgroundColor:"#000"},
        containerCss:{width:"480px", color:"#bbb", backgroundColor:"#fff", border:"none", padding:"0px"},
        overlayClose:true,
        persist:true
    });
}

/**
 * Shows the Modal to display messages
 */
function showMessageModal() {
    $("#message_modal").modal({
        opacity:80,
        overlayCss: {backgroundColor:"#000"},
        containerCss:{width:"480px", color:"#bbb", backgroundColor:"#fff", border:"none", padding:"0px"},
        overlayClose:true,
        persist:false
    });
}

/**
 * Calls the delete request and if successful forwards to the succesUrl,
 * otherwise displays validation errors in a modal popup
 */
function processDeleteRequest(succesUrl, dataUrl, modelName) {
    $.getJSON(dataUrl, function(result) {
        if (result.success) {
            window.location.href = succesUrl;
        } else {
            $('#message_content').empty();
            if (result.error.message) {
                $('<span>').append('This '+modelName+' could not be deleted. Reason: ').append(result.error.message)
                           .append('<br>').appendTo('#message_content');
            }
            if (result.error.campaigns && result.error.campaigns.length > 0 ) {
                $('<span>').append('This '+modelName+' is used by The following Campaigns and can not be deleted.')
                           .append('<br>').appendTo('#message_content');
                $.each(result.error.campaigns, function(i, item) {
                    $('<span> ' + item.title + '</span> <br/>' ).appendTo('#message_content');
                });
            }
            if (result.error.products && result.error.products.length > 0 ) {
                $('<span>').append('This '+modelName+' is used by The following Products and can not be deleted.')
                           .append('<br>').appendTo('#message_content');
                $.each(result.error.products, function(i, item) {
                    $('<span> ' + item.title + '</span> <br/>' ).appendTo('#message_content');
                });
            }
            if (result.error.purchaseOrders && result.error.purchaseOrders.length > 0 ) {
                $('<span>').append('This '+modelName+' is used by The following Purchase Orders and can not be deleted.')
                           .append('<br>').appendTo('#message_content');
                $.each(result.error.purchaseOrders, function(i, item) {
                    $('<span> ' + item.title + '</span> <br/>' ).appendTo('#message_content');
                });
            }
            showMessageModal();
        }
    }).error(function(error) {
        alert("There was an error process your request. Please contact System administrators.");
    });
}

/**
 * Creates a div with information, using the id of the checkbox value passed in.
 * @param	{Object}	checkbox	Description
 * @param	{Object}	elemName	Description
 * @returns	{Object}				Description
 */
function handle(checkbox, elemName) {
    var key = splitKey(checkbox.value);
    if(checkbox.checked) {
        $('<div id="'+key.id+'">').append(key.name).appendTo(elemName);
    } else {
        $('#'+key.id).remove();
    }
}

/**
 * Shows the laoding Modal
 */
function showLoader() {
    $('#loader').modal({opacity:40, overlayCss: {backgroundColor:"#fff"}});
}

function hideLoader() {
    $.modal.close();
}


/**
 * Given a date, returns the time difference between them in minutes. 
 * @returns	{Object}			Description
 */
function timeDiff(base, outDate) {
    return moment(base).diff( outDate, 'minutes');
}
