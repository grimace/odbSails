/**
 * CampaignController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
	// Find a single Campaign - JSON Response
    find: function( req, res ) {
        var cid = req.param('cid');
        Campaign.findOne().where({'id' : cid }).exec(function(err, campaign) {
            if (err) { sails.log.warn(err); }
            sails.log.debug("Found " + campaign);
            res.json( campaign );
        });
    },
    findpobudget: function( req, res ) {
        var pid = req.param('pid');
        sails.log.debug("Found PO Id:" + pid);
        PurchaseOrder.findOne().where({'id' : pid }).exec(function(err, po) {
            if (err) { sails.log.warn(err); }
            if (!po) {
                res.json({});
            }
            sails.log.debug("Found PO:" + po.title);
            Budget.findOne().where({'id' : po.budget.id}).exec(function(err, budget) {
                po.budget = budget;
                sails.log.debug("Found Budget:" + budget.title);
                res.json( po );
            });
        });
    },
    // standard actions
    list: function( req, res ) {
        Campaign.find().exec(function(err, campaigns) {
            if (err) { sails.log.warn(err); }
            sails.log.debug("Found " + campaigns.length + " Campaigns.");
            res.view('campaign/list', { campaigns: campaigns });
        });
    },
    create: function( req, res ) {
        var model = buildModel(req);

        sails.log.debug("Creating Campaign " + JSON.stringify(model));
        Campaign.create( model ).exec(function(err, campaign) {
            // Error handling
            if (err) return res.send(err,500);
            // If campaign was create successfully,
            PurchaseOrder.update({id:model.purchaseOrder.id},
                                 {campaign:{id:campaign.id, title:campaign.title}}).exec( function(err, po) {
                if (err) return res.send(err,500);
                res.redirect('/campaign/list');
            })
        });
    },
    new: function(req, res) {
        res.view('campaign/new');
    },
    edit: function(req, res) {
        var cid = req.param('cid');
        sails.log.debug("Campaign Id: " + cid);

        Campaign.findOne().where(
            { id : cid }
        ).exec(function(err, campaign) {
                if (err) return res.send(err,500);
                if ( campaign == undefined || campaign == null ) return res.send("campaign not found", 404);

                async.parallel({
                    products: function(callback) {
                        var ids = campaign.products.map(function(p) { return p.id } );
                        Product.find( { id: ids } ).exec(function(err, products) {
                            callback(null, products);
                        })
                    },
                    coupons: function(callback) {
                        var ids = campaign.coupons.map(function(c) { return c.id } );
                        Coupon.find( { id: ids } ).exec(function(err, data) {
                            callback(null, data);
                        })

                    },
                    ads: function(callback) {
                        var ids = campaign.ads.map(function(a) { return a.id } );
                        Ad.find( { id: ids } ).exec(function(err, data) {
                            callback(null, data);
                        })
                    }
                }, function (err, results) {
                    var data = { campaign: campaign, products: results.products, coupons: results.coupons, ads: results.ads };
                    //sails.log.debug(data);
                    res.view('campaign/edit', data);
                });
            });

    },
    update: function( req, res ) {
        var model = buildModel(req);
        sails.log.debug("Update Campaign: " + JSON.stringify(model));
        Campaign.update(
            {
                id: req.param("cid")
            }, model
        ).exec(function(err, campaign) {
                // Error handling
                if (err) return res.send(err,500);
                res.redirect('/campaign/list');
        });
    },
    remove: function (req,res) {
        var cid = req.param('cid');
        Campaign.findOne().where({'id' : cid }).exec(function(err, campaign) {
            if (err) { sails.log.warn(err); }

            if (!campaign) { if (err) return res.json(new MessageResponse( false, 'Campaign not found')); }

            if (campaign.action && campaign.action.type === 'activated') {
                return res.json(new MessageResponse(false, 'Active Campaigns can\'t be deleted.'));
            }
            sails.log.debug("Deleting Found " + JSON.stringify(campaign));

            async.parallel({
                po : function (callback) {
                        PurchaseOrder.update({'campaign.id' : cid },
                                     {campaign:null} ).exec( function(err, po) {
                            if (err) sails.log.error(err);
                            callback(null, po);
                        });
                    },
                c : function (callback) {
                    Campaign.destroy().where(
                        { id : cid }
                    ).exec(function(err, cmp) {
                        if (err) sails.log.error(err);
                        callback(null, cmp);
                    });
                },
            },
            function (err, results) {
                if (err) return res.send(err,500);
                res.json(new MessageResponse(true));
            });
        });
    },
    report: function(req, res) {
        res.view('campaign/reports');
    }

};

// converts the req into a model
function buildModel(req) {
    // get all the data
    var data = modelhelper.parse(req);
    var util = stringutil.util;
    // parse values
    var dates = util.parseDateRange(data.dateRange);
    var purchase;
    if (data.purchase) {
        var purchase = util.splitKey(data.purchase);
    }

    var rule = {};
    rule.days = data.ruledays;
    rule.hours = data.rulehours;
    rule.gender = data.rulegender;

    var products = [];
    var productKeys = data.products;
    products = util.parseKeyArray(products, productKeys);

    var coupons = [];
    var couponKeys = data.coupons;
    coupons = util.parseKeyArray(coupons, couponKeys);

    var ads = [];
    var adKeys = data.ads;
    ads = util.parseKeyArray(ads, adKeys);

    // populate the model.
    var model = {};
    model.title = data.title;
    model.description = data.description;

    // Purchase order cant be updated so may not be populated.
    if (purchase) {
        model.purchaseOrder = purchase;
    }
    model.startDate = dates.start;
    model.endDate = dates.end;
    model.rule = rule;
    model.coupons = coupons;
    model.products = products;
    model.ads = ads;
    if (data.activate == "true") {
        var action = {};
        action.type = "activated";
        action.date = new Date();
        action.by = req.user.userid;
        model.action = action;
    }
    if (data.deactivate == "true") {
        var action = {};
        action.type = "deactivated";
        action.date = new Date();
        action.by = req.user.userid;
        model.action = action;
    }
    return model;
}
