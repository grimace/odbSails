/**
 * MarketingController
 *
 * @description :: Server-side logic for managing Marketings
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var request = require('request');

module.exports = {

    brandRollup : function( req, res ) {
        var dates;
        if (req.param('brandDate')) {
            dates = util.parseDateRange(data.dateRange);
        }
        async.waterfall([
            function(callback){
                var map = {};
                Budget.find().exec(function(err, budgets) {
                    if (err) { sails.log.warn(err); }
                    for (var i =0; i< budgets.length; i++) {
                        var brand = budgets[i].brand;
                        if ( map[brand] ) {
                            map[brand].push(budgets[i].id);
                        } else {
                            map[brand] = [ budgets[i].id ];
                        }
                    }
                    callback(null, map);
                });
            },
            function(bMap, callback){

                var poMap = {};
                var brandArray = [];
                for (var key in bMap) {
                    brandArray.push(key);
                    poMap[key] = [];
                }

                async.eachSeries(brandArray, function( brand, callback) {
                    PurchaseOrder.find().where({'budget.id' : bMap[brand] }).exec(function(err, pos) {
                        if (err) { sails.log.warn(err); }

                        for (var i =0; i< pos.length; i++) {
                            poMap[brand].push(pos[i].id);
                        }
                        callback();
                    });
                }, function(err){
                    if( err ) {
                      sails.log.error(err);
                    }
                    sails.log.debug("finished Purchase Order processing");
                    callback(null, poMap);
                });

            },
            function(poMap, callback){
                // loop through PO finding all campaigns.
                var cMap = {};
                var brandArray = [];
                for (var key in poMap) {
                    brandArray.push(key);
                    cMap[key] = { ads: [], coupons: [], products: [] };
                }

                async.eachSeries(brandArray, function( brand, callback) {
                   Campaign.find().where({'purchaseOrder.id' : poMap[brand] }).exec(function(err, campaigns) {
                        if (err) { sails.log.warn(err); }

                        for (var i =0; i< campaigns.length; i++) {
                            if (campaigns[i].ads) {
                                var campaignAds = campaigns[i].ads;
                                for (var a =0; a < campaignAds.length; a++) {
                                    addIfNotPresent(cMap[brand].ads, campaignAds[a]);
                                }
                            }
                            if (campaigns[i].coupons) {
                                var campaignCoupons = campaigns[i].coupons;
                                for (var c =0; c < campaignCoupons.length; c++) {
                                    addIfNotPresent(cMap[brand].coupons, campaignCoupons[c]);
                                }
                            }
                            if (campaigns[i].products) {
                                var campaignProducts = campaigns[i].products;
                                for (var p =0; p < campaignProducts.length; p++) {
                                    addIfNotPresent(cMap[brand].products, campaignProducts[p]);
                                }
                            }
                        }
                        callback();
                    });
                }, function(err){
                    if( err ) {
                      sails.log.error(err);
                    }
                    sails.log.debug("finished Campaign processing");
                    callback(null, cMap);
                });
            },
            function(cMap, callback){
                var brandProducts = {};
                var brandArray = [];
                // build a list of product Id's only - sorted by brand
                for (var key in cMap) {
                    brandProducts[key] = [];
                    brandArray.push(key);
                    for (var i = 0; i < cMap[key].products.length; i++) {
                        brandProducts[key].push(cMap[key].products[i].id);
                    }
                }
                sails.log.error(JSON.stringify(brandProducts));

                async.eachSeries(brandArray, function( brand, callback) {
                   Product.find().where({id : brandProducts[brand] }).exec(function(err, products) {
                        if (err) { sails.log.warn(err); }

                        for (var i =0; i< products.length; i++) {
                            if (products[i].ads) {
                                var pAds = products[i].ads;
                                for (var a =0; a < pAds.length; a++) {
                                    addIfNotPresent(cMap[brand].ads, pAds[a]);
                                }
                            }
                            if (products[i].coupons) {
                                var pCoupons = products[i].coupons;
                                for (var c =0; c < pCoupons.length; c++) {
                                    addIfNotPresent(cMap[brand].coupons, pCoupons[c]);
                                }
                            }
                        }
                        callback();
                    });
                }, function(err){
                    if( err ) {
                      sails.log.error(err);
                    }
                    for (var key in cMap) {
                        delete cMap[key].products;
                    }
                    sails.log.debug("finished Product processing");
                    callback(null, cMap);
                });
            }
        ], function (err, result) {
           // result now equals 'done'
            res.json( result );
        });

    },

    marketRollup : function( req, res ) {
        var dates;
        if (req.param('marketDate')) {
            dates = util.parseDateRange(data.dateRange);
        }
        async.waterfall([
            function(callback){
                var markets = {};
                PurchaseOrder.find().where({'action.type' : 'approved' }).exec(function(err, pos) {
                    if (err) { sails.log.warn(err); }

                    for (var i =0; i< pos.length; i++) {
                        var market = pos[i].targetMarket;
                        if (markets[market]) {
                            markets[market].pos.push(pos[i].id);
                        } else {
                            markets[market] = {pos :[pos[i].id] };
                        }
                    }
                    callback(null, markets);
                });
            },
            function(markets, callback){
                // loop through PO finding all campaigns.
                var marketArray = [];
                for (var key in markets) {
                    marketArray.push(key);
                    markets[key].ads = [];
                    markets[key].coupons = [];
                    markets[key].products = [];
                }

                async.eachSeries(marketArray, function( market, callback) {
                   Campaign.find().where({'purchaseOrder.id' : markets[market].pos }).exec(function(err, campaigns) {
                        if (err) { sails.log.warn(err); }

                        for (var i =0; i< campaigns.length; i++) {
                            if (campaigns[i].ads) {
                                var campaignAds = campaigns[i].ads;
                                for (var a =0; a < campaignAds.length; a++) {
                                    addIfNotPresent(markets[market].ads, campaignAds[a]);
                                }
                            }
                            if (campaigns[i].coupons) {
                                var campaignCoupons = campaigns[i].coupons;
                                for (var c =0; c < campaignCoupons.length; c++) {
                                    addIfNotPresent(markets[market].coupons, campaignCoupons[c]);
                                }
                            }
                            if (campaigns[i].products) {
                                var campaignProducts = campaigns[i].products;
                                for (var p =0; p < campaignProducts.length; p++) {
                                    addIfNotPresent(markets[market].products, campaignProducts[p]);
                                }
                            }
                        }
                        callback();
                    });
                }, function(err){
                    if( err ) {
                      sails.log.error(err);
                    }
                    sails.log.debug("finished Campaign processing");
                    callback(null, markets);
                });
            },
            function(markets, callback){
                var products = {};
                var marketArray = [];
                // build a list of product Id's only - sorted by brand
                for (var key in markets) {
                    products[key] = [];
                    marketArray.push(key);
                    for (var i = 0; i < markets[key].products.length; i++) {
                        products[key].push(markets[key].products[i].id);
                    }
                }
                sails.log.error(JSON.stringify(products));

                async.eachSeries(marketArray, function( market, callback) {
                   Product.find().where({id : products[market] }).exec(function(err, products) {
                        if (err) { sails.log.warn(err); }

                        for (var i =0; i< products.length; i++) {
                            if (products[i].ads) {
                                var pAds = products[i].ads;
                                for (var a =0; a < pAds.length; a++) {
                                    addIfNotPresent(markets[market].ads, pAds[a]);
                                }
                            }
                            if (products[i].coupons) {
                                var pCoupons = products[i].coupons;
                                for (var c =0; c < pCoupons.length; c++) {
                                    addIfNotPresent(markets[market].coupons, pCoupons[c]);
                                }
                            }
                        }
                        callback();
                    });
                }, function(err){
                    if( err ) {
                      sails.log.error(err);
                    }
                    for (var key in markets) {
                        delete markets[key].products;
                        delete markets[key].pos;
                    }
                    sails.log.debug("finished Product processing");
                    callback(null, markets);
                });
            }
        ], function (err, result) {
           // result now equals 'done'
            res.json( result );
        });

    },
    retailerRollup : function( req, res ) {
        var dates;
        if (req.param('retailerDate')) {
            dates = util.parseDateRange(data.dateRange);
        }
        async.waterfall([
            function(callback){
                var retailers = {};
                PurchaseOrder.find().where({'action.type' : 'approved' }).exec(function(err, pos) {
                    if (err) { sails.log.warn(err); }

                    for (var i =0; i< pos.length; i++) {
                        var retailer = pos[i].retailer;
                        if (retailers[retailer]) {
                            retailers[retailer].pos.push(pos[i].id);
                        } else {
                            retailers[retailer] = {pos :[pos[i].id] };
                        }
                    }
                    callback(null, retailers);
                });
            },
            function(retailers, callback){
                // loop through PO finding all campaigns.
                var retailerArray = [];
                for (var key in retailers) {
                    retailerArray.push(key);
                    retailers[key].ads = [];
                    retailers[key].coupons = [];
                    retailers[key].products = [];
                }

                async.eachSeries(retailerArray, function( retailer, callback) {
                   Campaign.find().where({'purchaseOrder.id' : retailers[retailer].pos }).exec(function(err, campaigns) {
                        if (err) { sails.log.warn(err); }

                        for (var i =0; i< campaigns.length; i++) {
                            if (campaigns[i].ads) {
                                var campaignAds = campaigns[i].ads;
                                for (var a =0; a < campaignAds.length; a++) {
                                    addIfNotPresent(retailers[retailer].ads, campaignAds[a]);
                                }
                            }
                            if (campaigns[i].coupons) {
                                var campaignCoupons = campaigns[i].coupons;
                                for (var c =0; c < campaignCoupons.length; c++) {
                                    addIfNotPresent(retailers[retailer].coupons, campaignCoupons[c]);
                                }
                            }
                            if (campaigns[i].products) {
                                var campaignProducts = campaigns[i].products;
                                for (var p =0; p < campaignProducts.length; p++) {
                                    addIfNotPresent(retailers[retailer].products, campaignProducts[p]);
                                }
                            }
                        }
                        callback();
                    });
                }, function(err){
                    if( err ) {
                      sails.log.error(err);
                    }
                    sails.log.debug("finished Campaign processing");
                    callback(null, retailers);
                });
            },
            function(retailers, callback){
                var products = {};
                var retailerArray = [];
                // build a list of product Id's only - sorted by brand
                for (var key in retailers) {
                    products[key] = [];
                    retailerArray.push(key);
                    for (var i = 0; i < retailers[key].products.length; i++) {
                        products[key].push(retailers[key].products[i].id);
                    }
                }

                async.eachSeries(retailerArray, function( retailer, callback) {
                   Product.find().where({id : products[retailer] }).exec(function(err, products) {
                        if (err) { sails.log.warn(err); }

                        for (var i =0; i< products.length; i++) {
                            if (products[i].ads) {
                                var pAds = products[i].ads;
                                for (var a =0; a < pAds.length; a++) {
                                    addIfNotPresent(retailers[retailer].ads, pAds[a]);
                                }
                            }
                            if (products[i].coupons) {
                                var pCoupons = products[i].coupons;
                                for (var c =0; c < pCoupons.length; c++) {
                                    addIfNotPresent(retailers[retailer].coupons, pCoupons[c]);
                                }
                            }
                        }
                        callback();
                    });
                }, function(err){
                    if( err ) {
                      sails.log.error(err);
                    }
                    for (var key in retailers) {
                        delete retailers[key].products;
                        delete retailers[key].pos;
                    }
                    callback(null, retailers);
                });
            }
        ], function (err, result) {
           // result now equals 'done'
            res.json( result );
        });
    },
    genderRollup : function( req, res ) {
        var dates;
        if (req.param('genderDate')) {
            dates = util.parseDateRange(data.dateRange);
        }
        async.waterfall([
            function(callback){
                // loop through all campaigns.
                var gender = {};
                Campaign.find().exec(function(err, campaigns) {
                    if (err) { sails.log.warn(err); }
                    for (var i =0; i< campaigns.length; i++) {
                        var genderType = campaigns[i].rule.gender;
                        if (!gender[genderType]) {
                            gender[genderType] = {ads:[], coupons:[], products:[]};
                        }

                        if (campaigns[i].ads) {
                            var campaignAds = campaigns[i].ads;
                            for (var a =0; a < campaignAds.length; a++) {
                                addIfNotPresent(gender[genderType].ads, campaignAds[a]);
                            }
                        }
                        if (campaigns[i].coupons) {
                            var campaignCoupons = campaigns[i].coupons;
                            for (var c =0; c < campaignCoupons.length; c++) {
                                addIfNotPresent(gender[genderType].coupons, campaignCoupons[c]);
                            }
                        }
                        if (campaigns[i].products) {
                            var campaignProducts = campaigns[i].products;
                            for (var p =0; p < campaignProducts.length; p++) {
                                addIfNotPresent(gender[genderType].products, campaignProducts[p]);
                            }
                        }
                    }
                    callback(null, gender);
                 });
            },
            function(gender, callback){
                var products = {};
                var genderArray = [];
                // build a list of product Id's only - sorted by gender
                for (var key in gender) {
                    products[key] = [];
                    genderArray.push(key);
                    for (var i = 0; i < gender[key].products.length; i++) {
                        products[key].push(gender[key].products[i].id);
                    }
                }

                async.eachSeries(genderArray, function( genderType, callback) {
                   Product.find().where({id : products[genderType] }).exec(function(err, products) {
                        if (err) { sails.log.warn(err); }

                        for (var i =0; i< products.length; i++) {
                            if (products[i].ads) {
                                var pAds = products[i].ads;
                                for (var a =0; a < pAds.length; a++) {
                                    addIfNotPresent(gender[genderType].ads, pAds[a]);
                                }
                            }
                            if (products[i].coupons) {
                                var pCoupons = products[i].coupons;
                                for (var c =0; c < pCoupons.length; c++) {
                                    addIfNotPresent(gender[genderType].coupons, pCoupons[c]);
                                }
                            }
                        }
                        callback();
                    });
                }, function(err){
                    if( err ) {
                      sails.log.error(err);
                    }
                    for (var key in gender) {
                        delete gender[key].products;
                    }
                    callback(null, gender);
                });
            }
        ], function (err, result) {
           // result now equals 'done'
            res.json( result );
        });
    },

    rollupExport : function( req, res ) {
        var util = stringutil.util;
        var start, end;

        var dateRange = req.param("dateRange");
        if (!dateRange) {
            // default to last 7 days
            start = dateutil.moment(new Date).subtract("days", 7).toDate();
            end = new Date();
        } else {
            // parse values
            var dates = util.parseDateRange(dateRange);
            start = dateutil.formatDate( dateutil.parseDate(dates.start), "YYYY-MM-DDTHH:mm:ss" ).concat("gmt");
            end = dateutil.formatDate( dateutil.parseDate(dates.end), "YYYY-MM-DDTHH:mm:ss" ).concat("gmt");
        }

        var detail = "FINEST";
        var email = req.user.email;

        var url = 'http://report.kombicorp.net/rptgen?';
        url += 'detail=' + detail + '&';
        url += 'start=' + start + '&';
        url += 'end=' + end + '&';
        url += 'email=' + email;

        sails.log.info("URL " + url );

        request({uri: url, timeout:60000} , function (error, response, body) {
            if (!error && response.statusCode == 200) {
                sails.log.info("Export Job Requested");
                res.json(new MessageResponse(true));
            } else {
                res.json(new MessageResponse(false, 'error: '+ JSON.stringify(error)));
//              res.json(new MessageResponse(false, 'error: '+ response.statusCode));
            }
        })
    },

    rollupJobView : function( req, res ) {
        Job.find().where({DISCRIMINATOR:'rollup', status:'active'})
            .exec(function(err, job) {
                if( err ) {
                  sails.log.error(err);
                }
                sails.log.debug(JSON.stringify(job));
                var result = { active : false };
                if (job.length > 0) {
                    result.active = true;
                    result.start = dateutil.moment(job[0].created).format('MM/DD/YYYY h:mm:ss a');
                }
                res.view('marketing/jobexport', { job : result } );
        });
    }

};

// Adds the item to the base array if not already present - checks by item.id
function addIfNotPresent(base, item) {
    var i = base.length;
    var found = false;
    while( i-- ) {
        if (base[i].id === item.id) {
            base[i].count++;
            found = true;
        }
    }
    if (!found) {
        item.count = 1;
        base.push(item);
    }

}
