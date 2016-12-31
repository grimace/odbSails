/**
 * ProfileController
 *
 * @description :: Server-side logic for managing profiles
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	 // This action can only be reached when logged in
    restricted: function(req, res) {
        return res.ok("If you can see this you are authenticated!");
    },
    // This action can always be reached without login
    open: function(req, res) {
        return res.ok("This action is open!");
    },
    // This action is used to test parsing the json web token
    jwt: function(req, res) {
        return res.ok("You have a JSON web token!");
    }

};

