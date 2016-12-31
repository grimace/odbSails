/**
 * OpsUserController
 *
 * @description :: Server-side logic for managing Opsusers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var request = require('request');
module.exports = {

    /**
     * Used to reset a Users PIN for the Kiosk Mobile applications.
     */
    resetPIN: function(req, res) {
        var userEmail = req.param("userEmail");
        var ticketId = req.param("ticketId");
        var input = { userEmail: userEmail, ticketId: ticketId };
        var jsonObject = {
                jsonrpc: '2.0',
                id: '1',
                method: 'forgotPIN',
                params: [userEmail]
            };
        request({
                    uri: sails.config.alltmServerUrl,
                    method: 'POST',
                    json: jsonObject,
                    timeout:10000
                },
            function (error, response, body) {
                sails.log.debug(JSON.stringify(body));
                var msgRes = null;
                if (!error && response.statusCode == 200) {
                    if (body.result.success == 'SUCCESS') {
                        msgRes = new MessageResponse(true);
                        input.result = 'success';
                    } else {
                        msgRes = new MessageResponse(false, body.result.message);
                        input.result = body.result.success;
                    }
                } else {
                    msgRes = new MessageResponse(false, "Error processing request.");
                }

                ConsoleEvent.create( { type: 'operational',
                                       event: 'User Pin Reset',
                                       message:  input,
                                       userid: req.user.userid } ).exec(function(err, consoleEvent) {
                    // Error handling
                    if (err) sails.log.error(err);
                    sails.log.info(JSON.stringify(consoleEvent));
                });
                res.json(msgRes);
            });
    },

    userView: function(req, res) {
        res.view('ops/userreset');
    }

};

