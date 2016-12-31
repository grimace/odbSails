/**
* AuthController
*
* @module      :: Controller
* @description	:: Handles Authentication methods for Console application.
*                  These include processing login, password reset and logoout
*
*
* @docs        :: http://sailsjs.org/#!documentation/controllers
*/
var bcrypt = require('bcryptjs');
var passport = require('passport');
module.exports = {

    login: function (req, res) {
        res.view('auth/login', {layout: 'nochrome'} );
    },
    process: function(req, res){
        sails.log.debug("AuthController forwarding to passport");
        passport.authenticate('local', { failureRedirect: 'auth/login' },
            function (err, user) {
                sails.log.debug("auth user : "+user);
                req.logIn(user, function (err) {
                    if (err) {
                        sails.log.error('error logging in:', err);
                        res.locals.errorMsg = 'Invalid username or password.';
                        res.redirect('/login');
//                        res.view('auth/login', {layout: 'nochrome'} );
                        return;
                    }
                    sails.log.debug("AuthController.process - req.user : "+req.user);
                    sails.config.currentUser = req.user;
                    res.user = req.user;
                    res.authenticated = true;
                    res.redirect('/home');
//                    res.redirect('/');
                    return;
                });
            })(req, res);

    },
    logout: function (req,res){
        sails.log.debug("logging out user");
        req.logout();
        req.session.destroy();
        res.redirect('/');
    },
     /**
   * Render the registration page
   *
   * Just like the login form, the registration form is just simple HTML:
   *
      <form role="form" action="/auth/local/register" method="post">
        <input type="text" name="username" placeholder="Username">
        <input type="text" name="email" placeholder="Email">
        <input type="password" name="password" placeholder="Password">
        <button type="submit">Sign up</button>
      </form>
   *
   * @param {Object} req
   * @param {Object} res
   */
  register: function (req, res) {
    res.view({
      errors: req.flash('error')
    });
  },

    /**
     * Generates a email with a temporary unique URL to allow a user to reset their password.
     */
    requestResetPassword: function( req, res ) {
        sails.log.debug("Calling requestResetPassword");
        var email = req.param("email");
        if (!email) {
            res.json(new MessageResponse(false, "Email is not valid"));
            return;
        }
        Member.findOne().where({email : email}).exec(function(err, user){
            if (err) return res.json(new MessageResponse(false, "Error looking up user account."));
            if (!user) return res.json(new MessageResponse(false, "User Account not found."));
            
            var userId = user.userid;
            // generate unique url (salted user id?)
            var hash = bcrypt.hashSync(userId, 8);
            var resetRequest = { date: new Date(), id: hash };
            // Save the request to the user object
            Member.update( { userid: userId }, { resetRequest:resetRequest } )
                .exec(function(err, users) {
                    if (err) return res.json(new MessageResponse(false, "Error looking up user account."));
                    if (users.length == 0 ) { return res.json(new MessageResponse(false, "Error looking up user account.")); }
                    // create email and Send
                    var user = users[0];
                    
                    // Note: we encode the URL before adding it to the email. It gets decoded by sails when it comes back
                    var url = sails.config.serverUrl + '/reset/'+ user.userid+'/' + encodeURIComponent(user.resetRequest.id);
                    var mailOptions = { from: 'support@kombicorp.com', // sender address
                                        to: user.email, // list of receivers
                                        subject: 'Reset Password Request', // Subject line
                                        html: '<html><p>Click the link below to reset your password</p>' +
                                              ' <a href="'+url+'">Reset Password</a></html>' };
                    smtpMailer.sendMail(mailOptions, function(err, info){
                        if (err) return res.json(new MessageResponse(false, "Error sending email("+err.message+")."));
                        console.log('Message sent: ' + info.response);
                        // send JSON response back to UI
                        res.json(new MessageResponse(true));
                    });
                    
            });
            
        });       
        
    },
    /**
     * Takes a user request, verifying that the userid/hash match whats stored in the db.
     * Forwards to a view allowing them to reset password
     */
    verifyReset: function( req, res ) {
        sails.log.debug("Calling verifyReset");
        var hash = req.param("requestid");
        sails.log.debug(hash);
        var userid = req.param("userid"); 
        var availableDate = dateutil.moment(new Date()).subtract(24, "hours").toDate();
    Member.find().where( 
        {userid : userid, "resetRequest.id" : hash, 
         "resetRequest.date": { $gte: availableDate } } ).exec(function(err, users){
            if (err) return res.json(new MessageResponse(false, "Error looking up user account"));
            if (users.length < 1) {
                res.locals.errorMsg = 'Invalid Request.';
                res.view( 'auth/login', {layout: 'nochrome'} );
            } else {
                res.view( 'auth/resetpassword', {layout: 'nochrome'} );
            }
        });       
          
    },
    /**
     * Validates the temp credientials, resets the user password and removes the resetRequest
     */
    resetPassword: function( req, res ) {
        sails.log.debug("Calling resetPassword");
        var hash = req.param("requestid"); 
        var userid = req.param("userid");
        if ( req.param('password') != undefined && req.param('password' ).length > 0  ) {
            if ( req.param('password') != req.param('confirmation' ) ) {
                res.locals.errorMsg = 'Invalid Request.';
                res.view( 'auth/resetpassword', {layout: 'nochrome'} );
                return;
            }
        }
        var updateUser = { resetRequest : null,
                           password : req.param('password') };

        var availableDate = dateutil.moment(new Date()).subtract(24, "hours").toDate();
        Member.find().where( {userid : userid, "resetRequest.id" : hash, "resetRequest.date": { $gte: availableDate } } )
            .exec(function(err, users){
                if (err) return res.json(new MessageResponse(false, "Error looking up user account"));
                if (users.length < 1) {
                    res.locals.errorMsg = 'Invalid Request.';
                    res.view('auth/login', {layout: 'nochrome'} );
                } else {
                    var userId = users[0].userid;
                    // we found the user, update with new password, removing the reset request
                    Member.update( { userid: userId }, updateUser )
                        .exec(function(err, users) {
                            if (err || users.length ==0 ) {
                                res.locals.errorMsg = 'Unable to complete your request.';
                                res.view('auth/login', {layout: 'nochrome'} );
                            }
                            res.locals.errorMsg = 'Your password has been changed.';
                            res.view('auth/login', {layout: 'nochrome'} );
                        });
                }
        });       
          
    },

    get_user: function(req, res) {
        if ( !req.isAuthenticated() ) return res.forbidden();
        return res.json({user: req.user});
    }
    
    
};