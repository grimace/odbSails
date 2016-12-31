/**
 * UserController
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


   list: function (req, res) {
       //Role.find().exec( function(err, roles) {
       //     if (err) { sails.log.warn(err); }
       //     var result = [];
       //     for (var i = 0; i < roles.length; i++ ) {
       //         result.push(roles[i].role);
       //     }
       //     res.json(result);
       //});
       var list = [];
       var keylist = Object.getOwnPropertyNames(roles);
       for (var i=0; i < keylist.length; i++ ) {
            var key = keylist[i];
            var value = roles[key];
            if (value !== 'roles') {
                list.push(value);
            }
       }
       res.json(list);
   },
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {
      //rest: false,
      //shortcuts: false
  }

  
};
