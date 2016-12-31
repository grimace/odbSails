/**
 * PurchaseOrderController
 *
 * @description :: Server-side logic for managing Purchaseorders
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	// Return a specific PurchaseOrder
    find: function( req, res ) {
        var pid = req.param('pid');
        PurchaseOrder.findOne().where({'id' : pid }).exec(function(err, po) {
            if (err) { sails.log.warn(err); }
            sails.log.debug("Found " + po);
            res.json( po );
        });
    },
    // return Purchase orders that have not been assigned to campaigns
    available: function( req, res ) {
        PurchaseOrder.find( { 'campaign': null, 'action.type' : 'approved' } ).exec(function(err, pos) {
            if (err) { sails.log.warn(err); }
            sails.log.debug("Found " + pos.length + " Purchase Orders.");
            res.json( pos );
        });
    },

    // Standard actions
    list: function( req, res ) {

        PurchaseOrder.find().exec(function(err, pos) {
            if (err) { sails.log.warn(err); }
            sails.log.debug("Found " + pos.length + " Purchase Orders.");
            res.view('po/list', { pos: pos });
        });
    },
    create: function( req, res ) {
        var model = buildModel(req);

        PurchaseOrder.create( model ).exec(function(err, po) {
            // Error handling
            if (err) return res.send(err,500);
            res.redirect('/purchase/list');
        });
    },
    newpo: function(req, res) {
        res.view('po/new');
    },

    edit: function(req, res) {
        var pid = req.param('pid');
        sails.log.debug(" Purchase Order Id: " + pid);

        PurchaseOrder.findOne().where(
            { id : pid }
        ).exec(function(err, po) {
            if (err) { sails.log.debug(err); }
            if ( po == undefined || po == null ) return res.send("po not found", 404);
            sails.log.debug("Is Approved: " + po.approved());
            res.view('po/edit', { po: po });
        });

    },

    update: function( req, res ) {
        var model = buildModel(req);
        sails.log.debug("Update PurchaseOrder: " + JSON.stringify(model));
        PurchaseOrder.update(
            {
                id: req.param("pid")
            }, model
        ).exec(function(err, po) {
            // Error handling
            if (err) return res.send(err,500);
            res.redirect('/purchase/list');
        });
    },
    remove: function (req,res) {
        var pid = req.param('pid');
    
        PurchaseOrder.findOne( { id: pid } ).exec(function(err, po) {
            if (err) { sails.log.warn(err); }
            if ( !po ) {
                return res.send(new MessageResponse(false, 'PO not found'),500);
            }
            if ( po.campaign && po.campaign.id ) {
                // Campaign was found
                var list = [];
                list.push({id: po.campaign.id, title: po.campaign.title});
                
                var msg = new MessageResponse();
                msg.error.campaigns = list;
                res.json( msg );
            } else {
                // OK to delete
                PurchaseOrder.destroy().where(
                    { id : pid }
                ).exec(function(err, po) {
                        if (err) return res.send(new MessageResponse(false, 'Could not delete Purchase Order') ,500);
                        if ( po == undefined || po == null ) return res.send("po not found", 404);
                        res.json( new MessageResponse(true) );
                });
            }
        });

    },
    // Reporting Actions
    report: function(req, res) {
        res.view('po/reports');
    },
    spendmarket: function(req, res) {
        PurchaseOrder.native(function(err, collection) {
            if (err) return res.send(err, 500);
            collection.aggregate({ $group: {_id: '$targetMarket', count: {$sum : '$amount'}} },
                function(err, results) {
                    if (err) return res.send(err, 500);
                    var data = [];
                    for (var i=0; i < results.length; i++) {
                        var item = { label: results[i]._id, value: results[i].count };
                        data.push(item);
                    }
                    sails.log.debug(data);
                    res.json(data);
            });
        });
    },
    spendretailer: function(req, res) {
        PurchaseOrder.native(function(err, collection) {
            if (err) return res.send(err, 500);
            collection.aggregate({ $group: {_id: '$retailer', count: {$sum : '$amount'}} },
                function(err, results) {
                    if (err) return res.send(err, 500);
                    var data = [];
                    for (var i=0; i < results.length; i++) {
                        var item = { label: results[i]._id, value: results[i].count };
                        data.push(item);
                    }
                    sails.log.debug(data);
                    res.json(data);
            });
        });
    },
    pomarket: function(req, res) {
        PurchaseOrder.native(function(err, collection) {
            if (err) return res.send(err, 500);
            collection.aggregate({ $group: {_id: '$targetMarket', count: {$sum : 1}} },
                function(err, results) {
                    if (err) return res.send(err, 500);
                    var data = [];
                    for (var i=0; i < results.length; i++) {
                        var item = { label: results[i]._id, value: results[i].count };
                        data.push(item);
                    }
                    res.json(data);
            });
        });
    },
    poretailer: function(req, res) {
        PurchaseOrder.native(function(err, collection) {
            if (err) return res.send(err, 500);
            collection.aggregate({ $group: {_id: '$retailer', count: {$sum : 1}} },
                function(err, results) {
                    if (err) return res.send(err, 500);
                    var data = [];
                    for (var i=0; i < results.length; i++) {
                        var item = { label: results[i]._id, value: results[i].count };
                        data.push(item);
                    }
                    res.json(data);
            });
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
    var budget = util.splitKey(data.budget);
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
    model.budget = {id:budget.id, title:budget.name};
    model.description = data.description;
    model.targetMarket = data.targetMarket;
    model.retailer = data.retailer;
    model.amount = amount;
    model.startDate = dates.start;
    model.endDate = dates.end;
    return model;
}
