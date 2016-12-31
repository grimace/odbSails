/**
 * ProfileController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

    root: function (req,res) {
      sails.log.debug("Build Number: " + sails.config.build.buildNumber);
      res.view('network/index');
    },
    network: function (req,res) {
      res.view('network/index');
    },
    appmetrics: function (req,res) {
       res.view('network/appmetrics');
    },
    proof: function (req,res) {
       res.view('network/proof');
    },
    dsn: function (req, res) {
       res.view('dsn/index')  
    },
    library: function (req,res) {
        res.view('campaign/library');
    },
    rollup: function (req,res) {
        res.view('marketing/rollup');
    },
    tvOps: function (req,res) {
      res.view('tv/ops', { layout: 'tv_layout' } );
    },
    tvMap: function (req,res) {
      res.view('tv/map', { layout: 'tv_layout' } );
    },
    cacheManifest: function (req, res) {
      sails.log.info("Applying disable cache policy");
      res.header('Content-Type', 'text/cache-manifest');
      res.header('Cache-Control', 'max-age=0,no-cache, no-store, must-revalidate');
      res.header('Cache-Control', 'pre-check=0, post-check=0, max-age=0, max-stale = 0');
      res.header('Pragma', 'no-cache');
      res.header('Expires', 'Wed, 11 Jan 1984 05:00:00 GMT');
      res.header('ExpiresByType', 'text/cache-manifest "access plus 0 seconds"');
      res.render('cacheManifest');
    },
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to CodeController)
   */
  _config: {}

  
};
