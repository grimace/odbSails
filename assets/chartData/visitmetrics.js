/** CHART CODE NOW IN SAME ORDER AS PAGE DISPLAY **/

/**
 * Visit By Network Chart for APP METRICS view
 */
function visitByNetwork(dates, cb) {
    $.ajax({
        type: 'GET',
        url: '/alltmVisit/visitsByNetwork',
        data: dates,
        success: function(result) {
            if (hasVisitData(result)) {

                if (!! $('#visitGenderCount')) {
                    var total = 0;
                    result.map(function(item){
                        total += item[1];
                    });
                    $('#visitGenderCount').text(formatNumber(total));
                }

                var chart = c3.generate({
                    data: {
                        columns: result,
                        type: 'pie'
                    },
                    tooltip: {
                        format: {
                            title: function (d) { return 'Count'},
                            value: function (value, ratio, id) {
                                return value;
                            }
                        }
                    }

                });
            } else {
                $('#chart').html('<b>No Results</b>');
                if (!! $('#visitGenderCount')) {
                    $('#visitGenderCount').text(formatNumber(0));
                }

            }
        }
    }).always(function() {
        if (cb) {
            cb();
        }

    });
}

/**
 * Total Devices by Platform Chart
 */
function deviceTypeChart(dates, cb) {
    // Build Pie Chart
    var deviceUrl = "/devicemetrics/deviceType";
    $.ajax({
        type: "GET",
        url: deviceUrl,
        data: dates,
        success: function(data)
        {
            var total = 0;
            var input = data.map(function(item) {
                    var d = [];
                    d.push(item.label);
                    d.push(item.value);
                    total += item.value;
                    return d;
                });
            if (!! $('#deviceTypeCount')) {
                $('#deviceTypeCount').text(total);
            }
            c3.generate({
                bindto : '#platformChart',
                data: {
                    columns: input,
                    type : 'pie'
                },
                tooltip: {
                    format: {
                        title: function (d) { return 'Count ' },
                        value: function (value, ratio, id) {
                            var format = d3.format(',');
                            return format(value);
                        }
                    }
                }
            });
        }
    }).always(function() {
        if (cb) {
            cb();
        }
    });
}

/**
 * Kiosk Visits by Gender Chart
 */
function visitByGender(dates, cb) {
    $.ajax({
        type: 'GET',
        url: '/alltmVisit/visitsByNetwork',
        data: dates,
        success: function(result) {
            if (hasVisitData(result)) {

                if (!! $('#visitGenderCount')) {
                    var total = 0;
                    result.map(function(item){
                        total += item[1];
                    });
                    $('#visitGenderCount').text(formatNumber(total));
                }

                var chart = c3.generate({
                    bindto: '#genderChart',
                    data: {
                        columns: result,
                        type: 'pie'
                    },
                    tooltip: {
                        format: {
                            title: function (d) { return 'Count'},
                            value: function (value, ratio, id) {
                                return value;
                            }
                        }
                    }

                });
            } else {
                $('#genderChart').html('<b>No Results</b>');
                if (!! $('#visitGenderCount')) {
                    $('#visitGenderCount').text(formatNumber(0));
                }

            }
        }
    }).always(function() {
        if (cb) {
            cb();
        }

    });
}

/**
 * Kiosk Visits by Age Chart
 */
function visitByAge(dates, cb) {
    $.ajax({
        type: 'GET',
        url: '/alltmVisit/visitsByAge',
        data: dates,
        success: function(result) {
            if (hasVisitData(result)) {
                if (!! $('#visitAgeCount')) {
                    var total = 0;
                    result.map(function(item){
                        total += item[1];
                    });
                    $('#visitAgeCount').text(formatNumber(total));
                }

                var chart = c3.generate({
                    bindto: '#ageChart',
                    data: {
                        columns: result,
                        type: 'pie'
                    },
                    tooltip: {
                        format: {
                            title: function (d) { return 'Count'},
                            value: function (value, ratio, id) {
                                return value;
                            }
                        }
                    }

                });
            } else {
                $('#ageChart').html('<b>No Results</b>');
                if (!! $('#visitAgeCount')) {
                    $('#visitAgeCount').text(formatNumber(0));
                }

            }
        }
    }).always(function() {
        if (cb) {
            cb();
        }

    });
}

/**
 * Visit Per Day Chart
 */
function visitPerDay(dates, cb) {
    $.ajax({
        type: 'GET',
        url: '/alltmVisit/visitPerDay',
        data: dates,
        success: function(result) {

            var x = ["x"];
            var i = ["Visits"];
            var total = 0;
            result.map(function(item){
                    x.push(moment(item.start).format('YYYY-MM-DD'));
                    i.push(item.visit);
                    total += item.visit;
                });

            if (!! $('#visitCount')) {
                $('#visitCount').text(formatNumber(total));
            }

            var input = [x, i];
            var chart = c3.generate( {
                bindto: '#chartVisitPerDay',
                data: {
                    x : 'x',
                    columns: input,
                    type: 'line'
                },
                axis: {
                    x: {
                        type: 'timeseries',
                        tick: {
                            rotate: 75
                        },
                        height:40
                    }
                }
            });
        }
    }).always(function() {
        if (cb) {
            cb();
        }

    });

}

/**
 * checks visit results for any value
 */
function hasVisitData(result) {
    var hasValue = false;
    for (var i =0, j=result.length; i<j;i++){
        var value = result[i];
        if (value.length > 0 && value[1] !== 0) {
            hasValue = true;
            break;
        }
    }
    return hasValue;
}

/**
 * Visits by Avg Duration Chart
 */
function visitAvgDuration(dates, cb) {
    $.ajax({
        type: "GET",
        url: '/alltmVisit/visitAvgDuration',
        data: dates,
        success: function(result) {
            if (hasVisitData(result)) {
                var total = 0;
                var grps = 0;

                if (!! $('#avgDurationCount')) {

                    result.map( function( item ) {
                        if (item.length > 1 && item[1] !== 0) {

                            //total += item[1].total;
                            //grps += item[1].count;
                            total += parseFloat(item[1]);
                            grps++;
                        }
                    });
                    var avg = total/grps/1000;
                    $('#avgDurationCount').text(formatNumber(avg, 2) + ' secs');
                }

                var chartDuration = c3.generate({
                    bindto: '#chartAvgDuration',
                    data: {
                        columns: result,
                        type: 'pie'
                    },
                    tooltip: {
                        format: {
                            title: function (d) { return 'In Seconds'},
                            value: function (value, ratio, id) {
                                return formatNumber((value/1000), 2);
                            }
                        }
                    }
                });
            } else {
                $('#chartAvgDuration').html('<b>No Results</b>');
                if (!! $('#avgDurationCount')) {
                    $('#avgDurationCount').text(formatNumber(0, 2) + ' secs');
                }
            }
        }
    }).always(function() {
        if (cb) {
            cb();
        }
    });

}

/**
 * Builds the Device Type Chart
 */
function deviceTypeChart(dates, cb) {
    // Build Pie Chart
    var deviceUrl = "/devicemetrics/deviceType";
    $.ajax({
        type: "GET",
        url: deviceUrl,
        data: dates,
        success: function(data)
        {
            var total = 0;
            var input = data.map(function(item) {
                    var d = [];
                    d.push(item.label);
                    d.push(item.value);
                    total += item.value;
                    return d;
                });
            if (!! $('#deviceTypeCount')) {
                $('#deviceTypeCount').text(total);
            }
            c3.generate({
                bindto : '#platformChart',
                data: {
                    columns: input,
                    type : 'pie'
                },
                tooltip: {
                    format: {
                        title: function (d) { return 'Count ' },
                        value: function (value, ratio, id) {
                            var format = d3.format(',');
                            return format(value);
                        }
                    }
                }
            });
        }
    }).always(function() {
        if (cb) {
            cb();
        }
    });
}

function appMetricCounts(dates, cb) {

    var url = "/usermetrics/metrics";

    $.ajax({
        type: "POST",
        url: url,
        data: dates, // serializes the form's elements.
        success: function(data) {
            $("#created").html(data.createdUserAccounts);
            $("#deleted").html(data.deletedUserAccounts);
            $("#active").html(data.activeUserAccounts);
            $("#checkins").html(data.checkins);
            $("#checkouts").html(data.checkouts);
            $("#redeemed").html(data.redeem);
            $("#activateCoupons").html(data.activateCoupons);
            $("#addCoupons").html(data.addCoupons);
            $("#created, #deleted, #active, #redeemed, #checkins, #checkouts, #activateCoupons, #addCoupons")
                .css( "color", "steelblue" )
                .css( "font-size", "18pt")
                .css( "font-weight", "bold")
                .css( "text-align", "center")
                .css( "padding-top", "30px")
                .css( "padding-bottom", "30px");
        },
        error: function() {
            $("#created").html("Not Available.")
                .css( "color", "#666" )
                .css( "text-align", "center");
            $("#deleted").html("Not Available.")
                .css( "color", "#666" )
                .css( "text-align", "center");
            $("#active").html("Not Available.")
                .css( "color", "#666" )
                .css( "text-align", "center");
            $("#checkins").html("Not Available.")
                .css( "color", "#666" )
                .css( "text-align", "center");
            $("#checkouts").html("Not Available.")
                .css( "color", "#666" )
                .css( "text-align", "center");
            $("#redeemed").html("Not Available.")
                .css( "color", "#666" )
                .css( "text-align", "center");
            $("#activateCoupons").html("Not Available.")
                .css( "color", "#666" )
                .css( "text-align", "center");
            $("#addCoupons").html("Not Available.")
                .css( "color", "#666" )
                .css( "text-align", "center");
        },
        complete: function() {
            if (cb) {
                cb();
            }
        }
    });
}

// Build Registration Chart
function callRegistration(data, cb) {
    var url = "/devicemetrics/registerCounts";
    $.ajax({
        type: "POST",
        url: url,
        data: data, // serializes the form's elements.
        success: function(data)
        {
            var count = 0;
            var x = ["x"];
            var i = ["Registrations"];
            data.map(function(item){
                    x.push(item[0]);
                    i.push(item[1]);
                    count += item[1];
                });
            var input = [x, i];
            var countChart = c3.generate( {
                bindto: '#chartDevices',
                data: {
                    x : 'x',
                    x_format: '%m/%d/%Y',
                    columns: input,
                    type: 'line'
                },
                axis: {
                    x: {
                        type: 'timeseries',
                        tick: {
                            format: '%Y-%m-%d',
                            rotate: 75
                        },
                        height:70,
                        label: 'Date'
                    },
                    y: {
                        label: 'Registrations'
                    }
                }

                });
            $('#activateRegistrations').html( count );
            $('#totalUser').text( count );
            $("#activateRegistrations")
                .css( "color", "steelblue" )
                .css( "font-size", "18pt")
                .css( "font-weight", "bold")
                .css( "text-align", "center")
                .css( "padding-top", "30px")
                .css( "padding-bottom", "30px");
        }
    }).always(function() {
        if (cb) {
            cb();
        }
    });
}
