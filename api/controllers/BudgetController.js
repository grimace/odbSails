/**
 * BudgetController
 *
 * @description :: Server-side logic for managing Budgets
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    
    reportRomi: function (req, res) {
        
        //{ "BUDGET_NAME" : { amount: xxx, ROMI: xxxx, polist: [ { poName: "", amount: xxx, ads:[ {id:'', count:''} ], coupons:[  {id:'', count:''}  ] } ] } }
        var data = {
        };
        
        async.waterfall([
            function(callback){
                var budgetArray = [];
                PurchaseOrder.find().exec(function(err, pos) {
                    if (err) { sails.log.warn(err); }
                    for (var i=0; i<pos.length;i++) {
                        var po = pos[i];
                        if (po.action  && po.action.type == 'declinded') { continue; }
                        var bName = po.budget.title;
                        var found = false;
                        
                        if (! data[bName]) {
                            data[bName] = { amount: 0, romi: 0, polist:[],  ads:[], coupons:[], products: [] };
                            budgetArray.push(bName);
                        }
                        var potitle = po.title;
                        if (! po.action ) {
                            potitle = '* ' + potitle;
                        }
                        var podata = {id : po.id, name : potitle, amount: po.amount };
                        data[bName].amount += po.amount;
                        if (po.campaign) {
                            podata.campaign = po.campaign.id;
                        }
                        data[bName].polist.push(podata);
                    }
                    callback(null, budgetArray);
                });
            },
            function(budgetArray, callback){
                
                async.eachSeries(budgetArray, function( budget, callback) {
                    
                   var poids = data[budget].polist.map(function(po) { return po.id });
                   //sails.log.debug(poids);
                    
                   Campaign.find().where({'purchaseOrder.id' : poids }).exec(function(err, campaigns) {
                        if (err) { sails.log.warn(err); }
                        
                        for (var i =0; i< campaigns.length; i++) {
                            if (campaigns[i].ads) {
                                var campaignAds = campaigns[i].ads;
                                for (var a =0; a < campaignAds.length; a++) {
                                    var index = data[budget].ads.indexOf(campaignAds[a]);
                                    addToArray(data[budget].ads, campaignAds[a]);
                                }
                            }
                            if (campaigns[i].coupons) {
                                var campaignCoupons = campaigns[i].coupons;
                                for (var c =0; c < campaignCoupons.length; c++) {
                                    addToArray(data[budget].coupons, campaignCoupons[c]);
                                }
                            }
                            if (campaigns[i].products) {
                                var campaignProducts = campaigns[i].products;
                                for (var p =0; p < campaignProducts.length; p++) {
                                    if (data[budget].products.indexOf(campaignProducts[p].id) < 0 ) {
                                        data[budget].products.push(campaignProducts[p].id);
                                    }
                                }
                            }
                        }
                        callback();
                    });
                }, function(err){
                    if( err ) {
                      sails.log.error(err);
                    }
                    callback(null, budgetArray);
                });
            },
            function(budgetArray, callback){
                
                async.eachSeries(budgetArray, function( budget, callback) {
                   Product.find().where({id : data[budget].products }).exec(function(err, products) {
                        if (err) { sails.log.warn(err); }
            
                        for (var i =0; i< products.length; i++) {
                            if (products[i].ads) {
                                var pAds = products[i].ads;
                                for (var a =0; a < pAds.length; a++) {
                                    addToArray(data[budget].ads, pAds[a]);
                                }
                            }
                            if (products[i].coupons) {
                                var pCoupons = products[i].coupons;
                                for (var c =0; c < pCoupons.length; c++) {
                                    addToArray(data[budget].coupons, pCoupons[c]);
                                }
                            }
                        }
                        callback();
                        delete data[budget].products;
                    });
                }, function(err){
                    if( err ) {
                      sails.log.error(err);
                    }
                    callback(null, budgetArray);
                });

            },
        ], function (err, result) {
            // result now equals 'done'
            // Loop through getting count of ads and count of coupons per budget.
            // calculate the ROMI
            for( key in data ) {
                var count = 0;
                data[key].ads.map(function(item) { count += item.count } );
                data[key].coupons.map(function(item) { count += item.count } );
                var romi = data[key].amount / count;
                data[key].romi = romi.toFixed(2);
            }
            res.json( data );
        });
    },
    report: function (req, res) {
        var data = {
            name : "Budgets",
            children: []
        };
        PurchaseOrder.find().exec(function(err, pos) {
            if (err) { sails.log.warn(err); }
            for (var i=0; i<pos.length;i++) {
                var po = pos[i];
                if (po.action  && po.action.type == 'declinded') { continue; }
                var bName = po.budget.title;
                var found = false;
                for (var x=0; x<data.children.length; x++) {
                    var dc = data.children[x];
                    if (dc.name == bName) {
                        dc.children[0].size = (dc.children[0].size + po.amount);
                        var title = po.title;
                        if (! po.action ) {
                            title = '* ' + title;
                        }
                        dc.children[1].children.push({name: title, size: po.amount});
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    var title = po.title;
                    if (! po.action ) {
                        title = '* ' + title;
                    }
                    data.children.push({ name: bName, children : [
                        { name: bName, size: po.amount },
                        { name: bName, children: [{
                            name:title, size: po.amount
                            }]}
                    ] });
                }
            }
            res.json( data );
        });
    },
    budgetview: function (req,res) {
        res.view('budget/reports');
    },
    find: function( req, res ) {
        var bid = req.param('bid');
        Budget.findOne().where({'id' : bid }).exec(function(err, budget) {
            if (err) { sails.log.warn(err); }
            sails.log.debug("Found budget " + budget  + " for id: " + bid);
            res.json( budget );
        });
    },    
    approved: function( req, res ) {
        Budget.find().where({'action.type' : 'approved' }).exec(function(err, budgets) {
            if (err) { sails.log.warn(err); }
            sails.log.debug("Approved Budgets Found " + budgets.length + " Budgets.");
            res.json( budgets );
        });
    },    
    list: function( req, res ) {
        Budget.find().exec(function(err, budgets) {
            if (err) { sails.log.warn(err); }
            res.view('budget/list', { budgets: budgets });
        });
    },
    
    create: function( req, res ) {
        
        var model = buildModel(req);
        
        Budget.create( model ).exec(function(err, budget) {
            // Error handling
            if (err) return res.send(err,500);
            res.redirect('/budget/list');
        });
    },
    
    newbudget: function(req, res) {
        res.view('budget/new');
    },
    
    edit: function(req, res) {
        var bid = req.param('bid');
        sails.log.debug(" Budget Id: " + bid);

        async.parallel({
            one: function(callback) {
                // get the budget
                Budget.findOne().where(
                    { id : bid }
                ).exec(function(err, budget) {
                    if (err) { sails.log.debug(err); }
                    if ( budget == undefined || budget == null ) return res.send("budget not found", 404);
                    sails.log.debug("Is Approved: " + budget.approved());
                    callback(null, budget);
                });
            },
            two: function(callback) {
                // get the PO's associated (if any)
                PurchaseOrder.find( {'budget.id' : bid }).exec(function(err, pos) {
                    if (err) { sails.log.warn(err); }
                    sails.log.debug("Found " + pos.length + " Purchase Orders with Budget.");
                    callback(null, pos);
                });
            }
        }, function (err, results) {
            var budget = results.one;
            var pos = results.two;
            var remaining = budget.amount;
            if (pos) {
                for (var i=0; i<pos.length; i++) {
                    remaining -= pos[i].amount;
                }
            }
            res.view('budget/edit', { budget: budget, remaining: Math.round(remaining, -2), pos : pos });
        });
    },
    update: function( req, res ) {
        var model = buildModel(req);
        sails.log.debug("Update Budget: " + JSON.stringify(model));
        Budget.update(
            {
                id: req.param("bid")
            }, model
        ).exec(function(err, budget) {
                // Error handling
                if (err) return res.send(err,500);
                res.redirect('/budget/list');
        });
    },
    remove: function (req,res) {
        var bid = req.param('bid');
        
        PurchaseOrder.find( {'budget.id' : bid }).exec(function(err, pos) {
            if (err) { sails.log.warn(err); }
            sails.log.debug("Found " + pos.length + " Purchase Orders with Budget.");
            if ( pos != null && pos.length > 0 ) {
                // Purhcase orders where found - can't delete
                Budget.findOne().where(
                    { id : bid }
                ).exec(function(err, budget) {
                    if (err) { sails.log.debug(err); }
                    if ( budget == undefined || budget == null ) return res.send("budget not found", 404);
                    var list = [];
                    for (var i = 0; i < pos.length; i++) {
                        list.push( {id : pos[i].id, title: pos[i].title} );
                    }
                    var msg = new MessageResponse();
                    msg.error.purchaseOrders = list;
                    res.json( msg );
                });
            } else {
                // No PurhcaseOrders found, ok to delete
                Budget.destroy().where(
                    { id : bid }
                ).exec(function(err, budget) {
                        if (err) return res.send(err,500);
                        if ( budget == undefined || budget == null ) return res.send("budget not found", 404);
                        res.json(new MessageResponse(true));
                });
            }
        });
        
    }
	
};

function buildModel(req) {
    // get all the data
    var data = modelhelper.parse(req);
    var util = stringutil.util;
    // parse values
    var dates = util.parseDateRange(data.dateRange);
    var amount = util.stripCurrency(data.amount);
    // populate the model.
    var model = {};
    
    if (data.action) {
        var action = {};
        action.type = data.action;
        action.comment = data.comment;
        action.date = new Date();
        action.by = req.user.userid;
        model.action = action;
    }
    
    model.title = data.title;
    model.brand = data.brand;
    model.client = data.client;
    model.description = data.description;
    model.amount = amount;
    model.startDate = dates.start;
    model.endDate = dates.end;
    return model;   
}

/**
 * Ads the item if not already present - if present increments the count. Check based on id of object
 */
function addToArray(base, item) {
    var i = base.length;
    var found = false;
    while( i-- ) {
        if (base[i].id === item.id) {
            base[i].count++;
            found = true;
        }
    }
    if (!found) {
        base.push({id: item.id, count:1});
    }

}