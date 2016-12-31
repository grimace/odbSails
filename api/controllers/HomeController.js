/**
 * HomeController
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
    
  
//  index: function (req, res) {
//    res.view(null, {
//        title: 'Home'
//    });
//  },
//
//  /**
//   * Overrides for the settings in `config/controllers.js`
//   * (specific to HomeController)
//   */
//  _config: {}

   index: function(req, res) {
        var navItems = [
            {url: '/network', cssClass: 'fa fa-comments', title: 'Network'},
            {url: '/mobility', cssClass: 'fa fa-infoc-circle', title: 'Mobility'},
            {url: '/observation', cssClass: 'fa fa-comments', title: 'Observation'},
            {url: '/marketability', cssClass: 'fa fa-infoc-circle', title: 'Marketability'},
            {url: '/store', cssClass: 'fa fa-comments', title: 'Store'},
            {url: '/about', cssClass: 'fa fa-infoc-circle', title: 'About'}
        ];

        if (req.isAuthenticated()) {
            navItems.push({url: '/logout', cssClass: 'fa fa-comments', title: 'Logout'});
        }
        else {
            navItems.push({url: '/register', cssClass: 'fa fa-briefcase', title: 'Register'});
            navItems.push({url: '/login', cssClass: 'fa fa-comments', title: 'Login'});
        }

        res.view({
            title: 'Home',
            navItems: navItems,
            currentUser: req.user
        });
   },    
    
   login: function(req, res) {
        var navItems = [
            {url: '/register', cssClass: 'fa fa-comments', title: 'Register'},
            {url: '/about', cssClass: 'fa fa-infoc-circle', title: 'About'}
        ];

        if (req.isAuthenticated()) {
            navItems.push({url: '/logout', cssClass: 'fa fa-comments', title: 'Logout'});
        }
        else {
            navItems.push({url: '/register', cssClass: 'fa fa-briefcase', title: 'Register'});
            navItems.push({url: '/login', cssClass: 'fa fa-comments', title: 'Login'});
        }

        res.view({
            title: 'Login',
            navItems: navItems,
            currentUser: req.user
        });
    }    
    
  
};
