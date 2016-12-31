/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  *  If a request to a URL doesn't match any of the custom routes above, it  *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

  'get /': {
    controller: 'HomeController',
    action: 'index'
  },

  'post /login' : 'AuthController.process',

//  'get /login': 'AuthController.login',
  'get /login': {
    controller: 'AuthController',
     action:   'login'
      
  },
    
    
  'get /logout': 'AuthController.logout',
  'get /register': 'AuthController.register',

//  'post /auth/local': 'AuthController.callback',
//  'post /auth/local/:action': 'AuthController.callback',

    /**
     * User routes
     */

    'get /api/user': 'MemberController.getAll',
    'get /api/user/:id': 'MemberController.getOne',
    'post /api/user': 'MemberController.create',

    /////////////////////////////////////////
    // User Section
    '/user/view': {
        controller: 'UserController',
        action: 'view'
    },
    '/user/new': {
        controller: 'UserController',
        action: 'newuser'
    },
    '/user/create': {
        controller: 'UserController',
        action: 'create'
    },
    '/user/update/:userid': {
        controller: 'UserController',
        action: 'update'
    },
    '/user/:userid': {
        controller: 'UserController',
        action: 'profile'
    },
    '/user/remove/:userid': {
        controller: 'UserController',
        action: 'remove'
    },
    // End User Section

  /**
     * Message routes
     *
     */
    'get /api/message': 'MessageController.getAll',
    'get /api/message/:id': 'MessageController.getOne',
    'post /api/message': 'MessageController.create',
    'delete /api/message/:id': 'MessageController.destroy',

    
    '/dsn/remove/:mid': {
        controller: 'DSNController',
        action: 'removeMedia'
    },
    '/dsn/regions': {
        controller: 'DSNController',
        action: 'regions'
    },
    '/dsn/layouts': {
        controller: 'DSNController',
        action: 'layouts'
    },
    '/dsn/networks': {
        controller: 'DSNController',
        action: 'networks'
    },
    '/dsn/savelayout': {
        controller: 'DSNController',
        action: 'saveLayout'
    },
    '/dsn/findmedia/:id': {
        controller: 'DSNController',
        action: 'findMedia'
    },

    
  // If a request to a URL doesn't match any of the custom routes above, it is matched 
  // against Sails route blueprints.  See `config/blueprints.js` for configuration options
  // and examples.

  'get /home': 'HomeController.index',
  'get /network': 'HomeController.index',
  '/network/saveCompanyInfo': {
        controller: 'NetworkController',
        action: 'savecompanyinfo'
  },
  '/network/companyInfo': {
        controller: 'NetworkController',
        action: 'companyinfo'
  },
  'get /mobility': 'HomeController.index',
  'get /observation': 'HomeController.index',
  'get /marketability': 'HomeController.index',
  'get /store': 'HomeController.index',
  'get /about': 'HomeController.index'
};
