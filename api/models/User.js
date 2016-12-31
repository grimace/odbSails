/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

var bcrypt = require('bcryptjs');
module.exports = {

    attributes: {

        userid: {
            type: 'string',
            required: true,
            unique: true,
            minLength: 6,
            maxLength: 10
        },
        firstName: {
            type: 'string',
            required: true
        },
        lastName: {
            type: 'string',
            required: true
        },
        password: {
            type: 'string',
            required: true
        },
        phoneNumber: {
            type: 'string',
        },
        email: {
            type: 'email',
            required: true
        },
        // { date: '', requestId: '' }
        resetRequest: {
            type: 'json'
        },
        roles: {
            type: 'array'
        },
        toJSON: function () {
            var obj = this.toObject();
            delete obj.password;
            delete obj._csrf;
            return obj;
        }
    },

    /**
     * Hash the user Password
     */
    beforeCreate: function ( user, cb ) {
        bcrypt.genSalt( 10, function ( err, salt ) {
            bcrypt.hash( user.password, salt, function ( err, hash ) {
                if ( err ) {
                    sails.log.error( err );
                    cb( err );
                } else {
                    user.password = hash;
                    cb( null, user );
                }
            } );
        } );
    },
    
    /**
     * Check for user password, if being updated, Hash it.
     */
    beforeUpdate: function ( user, cb ) {
        // If we have a new password, hash it...
        if (user.password) {
            sails.log.debug("Hashing new password")
            bcrypt.genSalt( 10, function ( err, salt ) {
                bcrypt.hash( user.password, salt, function ( err, hash ) {
                    if ( err ) {
                        console.log( err );
                        cb( err );
                    } else {
                        user.password = hash;
                        cb( null, user );
                    }
                } );
            } );
        } else {
            cb( null, user );
        }

    }
};
