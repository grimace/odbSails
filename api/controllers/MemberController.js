/**
 * UserController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *              NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

    /**
     * Returns a list of all users
     * @param req
     * @param res
     */
    list: function ( req, res ) {
        Member.find().exec(function(err, users) {
            if (err) { sails.log.warn(err); }
            sails.log.debug("Found " + users.length + " Users.");
            res.json(users);
        });
    },

    create: function( req, res ) {
        var roles = req.param('role');
        if ( roles == null ) {
            roles = [];
        }
        if ( req.param('password') != req.param('confirmation' ) ) {
            res.view('user/newuser', { msg: 'passwords do not match' } );
            return;
        }
        Member.create({
            userid: req.param('userid'),
            firstName: req.param('firstName'),
            lastName: req.param('lastName'),
            phoneNumber: req.param('phoneNumber'),
            email: req.param('email'),
            password: req.param('password'),
            roles: roles
        }).exec(function(err, user) {
            // Error handling
            if (err) return res.send(err,500);
            res.redirect('/user/view');
        });
    },

    update: function( req, res ) {
        var roles = req.param('role');
        var updateUser = {
            firstName: req.param( 'firstName' ),
            lastName: req.param( 'lastName' ),
            phoneNumber: req.param( 'phoneNumber' ),
            email: req.param( 'email' )
        };
        
        if ( roles ) {
            updateUser.roles = roles;
        }
        
        if ( req.param('password') != undefined && req.param('password' ).length > 0  ) {
            if ( req.param('password') != req.param('confirmation' ) ) {
                res.json( { message: 'password does not match' } );
                return;
            }
            updateUser.password = req.param( 'password' );
        }
        sails.log.debug("User: " + JSON.stringify(updateUser));
        Member.update(
            {
                userid: req.param('userid')
            }, updateUser
        ).exec(function(err, user) {
            // Error handling
            if (err) return res.send(err,500);
            res.redirect('/user/view');
        });
    },
    // ///////////////////////////
    // user management section
    view: function (req,res) {
        Member.find().exec(function(err, users) {
            if (err) return res.send(err,500);
            if ( users == undefined || users == null ) return res.send("No users found", 404);
            sails.log.debug("Found " + users.length + " Users.");
            res.view({ users: users });
        });
    },

    newuser: function (req,res) {
        sails.log.debug("Calling newuser");
        res.view();
    },
    
    /**
     * Displays a user profile, allows access to the current user
     * when viewing themselves, otherwise requires Admin
     * @see /api/policies/userProfileView
     */
    profile: function (req,res) {
        var username = req.param('userid');
        sails.log.debug("userId: " + username);
        Member.findOne().where(
            { userid : username }
        ).exec(function(err, user) {
                if (err) { sails.log.debug(err); }
                if ( user == undefined || user == null ) return res.send("User not found", 404);
            res.view({user: user});
        });
    },

    remove: function (req,res) {
        var username = req.param('userid');
        sails.log.debug("userId: " + username);
        Member.destroy().where(
            { userid : username }
        ).exec(function(err, user) {
                if (err) {
                    var msg = new MessageResponse();
                    msg.error.message = err;
                    res.json(msg);
                }
                if ( user == undefined || user == null ) return res.send("User not found", 404);
                res.json( new MessageResponse(true) );
        });
    },

    	getAll: function(req, res) {
		Member.getAll()
		.spread(function(models) {
			res.json(models);
		})
		.fail(function(err) {
			// An error occured
		});
	},

	getOne: function(req, res) {
		Member.getOne(req.param('id'))
		.spread(function(model) {
			res.json(model);
		})
		.fail(function(err) {
			// res.send(404);
		});
	},

	createNot: function (req, res) {
		var model = {
			username: req.param('username'),
			email: req.param('email'),
			first_name: req.param('first_name')
		};

		Member.create(model)
		.exec(function(err, model) {
			if (err) {
				return console.log(err);
			}
			else {
				Member.publishCreate(model.toJSON());
				res.json(model);
			}
		});
	},

    <!-- end member management -->
    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to UserController)
     */
    _config: {
        rest: false,
        shortcuts: false
    }

};
