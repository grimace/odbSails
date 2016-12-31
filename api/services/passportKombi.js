/**
 * Created with IntelliJ IDEA.
 * User: gregorymace
 * Date: 12/11/13
 * Time: 5:00 PM
 * To change this template use File | Settings | File Templates.
 */
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcryptjs');

//helper functions
function findById(id, fn) {
    Member.findOne(id).exec(function (err, user) {
        if (err) {
            sails.log.debug("passportKombi.findById.error");
            return fn(null, null);
        } else {
            sails.log.debug("passportKombi.findById user found  : "+user);
            return fn(null, user);
        }
    });
}

function findByUsername(u, fn) {
    sails.log.debug("passportKombi.findByUsername : "+u);
    Member.findOne({
        userid : u
    }).exec(function (err, user) {
        // Error handling
        if (err) {
            sails.log.error("passportKombi.findByUsername - err : "+err);
            return fn(null, null);
        } else {
            // The User was found successfully!
            sails.log.debug("passportKombi.findByUsername - sucess : "+JSON.stringify(user));
            sails.config.currentUser = user;
            return fn(null, user);
        }
    });
}

// Passport session setup.
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session. Typically,
// this will be as simple as storing the user ID when serializing, and finding
// the user by ID when deserializing.
passport.serializeUser(function (user, done) {
    sails.log.debug("passportKombi.serializeUser : "+user);
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    //sails.log.debug("passport.deserializeUser : "+id);
    findById(id, function (err, user) {
        done(err, user);
    });
});

// Use the LocalStrategy within Passport.
// Strategies in passport require a `verify` function, which accept
// credentials (in this case, a username and password), and invoke a callback
// with a user object.
passport.use(new LocalStrategy(
    function (username, password, done) {
        sails.log.debug("passportKombi.localStrategy : "+username);
        // asynchronous verification, for effect...
        process.nextTick(function () {
            // Find the user by username. If there is no user with the given
            // username, or the password is not correct, set the user to `false` to
            // indicate failure and set a flash message. Otherwise, return the
            // authenticated `user`.
            findByUsername(username, function (err, user) {
                sails.log.debug("passportKombi.findByUsername done : "+JSON.stringify(user)+" , "+err);
                if (err) {
                    sails.log.error("passportKombi.passport.done : "+err);
                    return done(null, err);
                }
                if (!user) {
                    sails.log.debug("passportKombi - Unknown user : ");
                    return done(null, false, {
                        message: 'Unknown user ' + username
                    });
                }
                try {
                    console.log('passportKombi bcrypt comparing : '+password+' :, '+user.password);
                    bcrypt.compare(password, user.password, function (err, res) {
                        if (!res) {
                            sails.log.debug("bcrypt.compare returns false ");
                            return done(null, false, {
                                message: 'Invalid Password'
                            });
                        }
                        sails.log.debug("bcrypt.compare returns true");
                        var returnUser = {
                            username: user.userid,
                            createdAt: user.createdAt,
                            id: user.id
                        };
                        return done(null, returnUser, {
                            message: 'Logged In Successfully'
                        });
                    });
                } catch (err) {
                    sails.log.error("big fn problem here : "+err);
                }
            })

        });
    }
));