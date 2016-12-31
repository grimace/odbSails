/**
 * Describe different Event Types.
 *
 * Created by chuckf on 5/9/14.
 */

exports.types = function() {
    var type = {};
    type.register = 1;
    type.accountCreateEvent = 4;
    type.accountDeleteEvent = 5;
    type.signIn = 6;
    type.checkinEvent =7;
    type.checkoutEvent = 9;
    type.redeemCouponEvent = 10;
    type.addCouponEvent = 8;
    type.activateCouponEvent = 12;
    return type;
}
