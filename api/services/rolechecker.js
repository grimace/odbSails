/**
 * Checks to see if the supplied user has the specified role. Admin trumphs all.
 */

// export this to sails
exports.hasRole = function(user, role) {
    if (user.roles != null) {
        // if they have admin they win
        if (user.roles.indexOf(roles.admin) > -1 ) return true;
        // check for specific role
        if (user.roles.indexOf(role) > -1 )  return true;
    }
    return false;
}
