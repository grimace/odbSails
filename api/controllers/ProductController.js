/**
 * ProductController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
module.exports = {

    find: function(req, res) {
        var pid = req.param('pid');

        Product.findOne({id:pid}).exec(function(err, product) {
            if (err) { sails.log.warn(err); }
            sails.log.debug("Found " + product.name);
            res.json( product );
        });

    },
    list: function(req, res) {
        Product.find().exec(function(err, products) {
            if (err) { sails.log.warn(err); }
            sails.log.debug("Found " + products.length + " products.");
            res.json( products );
        });

    },
    catalog: function( req, res ) {

        Product.find().exec(function(err, products) {
            if (err) { sails.log.warn(err); }
            sails.log.debug("Found " + products.length + " Products.");
            res.view('campaign/product/catalog', { products: products });
        });
    },
    create: function( req, res ) {

        var model = buildModel(req);

        Product.create( model ).exec(function(err, product) {
            // Error handling
            if (err) return res.send(err,500);
            res.redirect('/campaign/product/catalog');
        });
    },

    newproduct: function(req, res) {
        res.view('campaign/product/newproduct');
    },

    edit: function(req, res) {
        var pid = req.param('pid');
        sails.log.debug(" Product Id: " + pid);

        Product.findOne().where(
            { id : pid }
        ).exec(function(err, product) {
            if (err) { sails.log.debug(err); }
            if ( product == undefined || product == null ) return res.send("Product not found", 404);
            res.view('campaign/product/edit', { product: product });
        });

    },
    update: function( req, res ) {
        var model = buildModel(req);
        sails.log.debug("Update Product: " + JSON.stringify(model));
        Product.update(
            {
                id: req.param("pid")
            }, model
        ).exec(function(err, product) {
                // Error handling
                if (err) return res.send(err,500);
                res.redirect('/campaign/product/catalog');
            });
    },
    remove: function (req,res) {
        var pid = req.param('pid');
        Campaign.native(function(err, collection) {
            if (err) return res.send(err, 500);
            sails.log.debug("Calling delete for " + pid);
            collection.find( {products: {$all: [ {"$elemMatch":{ id:pid } } ] } }).toArray(
                function(err, campaigns) {
					if ( campaigns.length > 0 ) {
                        var list = [];
                        for (var i=0; i<campaigns.length; i++) {
                            list.push({id: campaigns[i].id, title: campaigns[i].title});
                        }
                        var msg = new MessageResponse();
                        msg.error.campaigns = list;
		                res.json( msg );
					} else {
		                Product.destroy().where(
		                    { id : pid }
		                ).exec(function(err, product) {
			                if (err) return res.send(new MessageResponse(false, "Could not delete product"),500);
			                if ( product == undefined || product == null ) return res.send("product not found", 404);
		                    res.json( new MessageResponse(true) );
		                });

					}
                    // Is this valid code????
                    //var list = [];
                    //for (var i=0; i<campaigns.length; i++) {
                    //    list.push({id: campaigns[i].id, title: campaigns[i].title});
                    //}
            });
        });
    },

    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to UserController)
     */
    _config: {
        rest: false,
        shortcuts: false
    }

};

/**
 * Builds a model object from request
 * @param	{Object}	req	Description
 * @returns	{Object}		Description
 */
function buildModel(req) {

    var data = modelhelper.parse(req);
    var util = stringutil.util;

    var markets = req.param('marketAvailability');
    if ( markets == null ) {
        markets = [];
    }
    var coupons = [];
    var couponKeys = req.param('coupons');
    sails.log.debug("Coupon Keys: " + JSON.stringify(couponKeys));
    coupons = util.parseKeyArray(coupons, couponKeys);

    var ads = [];
    var adKeys = req.param('ads');
    sails.log.debug("Ad Keys: " + JSON.stringify(adKeys));
    ads = util.parseKeyArray(ads, adKeys);

    var model = {};
    model.marketAvailability = markets;
    model.name = data.name;
    model.brand = data.brand;
    model.description = data.description;
    model.coupons = coupons;
    model.ads = ads;

    return model;
}
