/**
 * Created by chuckf on 9/11/14.
 *
 * Wrapper around the nodeMailer Module. Takes a Mail Option object and callback as arguments.
 * @see https://github.com/andris9/Nodemailer#sending-mail for mail configuration options.
 *
 */
 var nodemailer = require('nodemailer');
 var request = require('request');
 var smtpTransport = require('nodemailer-smtp-transport');
 var transportOptions = {
     host: sails.config.smtpServer,
     port: sails.config.smtpPort,
     secure: sails.config.smtpSecure,
     ignoreTLS: true
 };
 if (sails.config.smtpUser) {
     transportOptions.auth = {user: sails.config.smtpUser, password: sails.config.smtpPassword};
 }
 var transporter = nodemailer.createTransport(smtpTransport(transportOptions));

 // Send email using SMTP node mailer. Requires SMTP server configure
 function sendSMTP( mailOptions, callback) {
     sails.log.debug("Sending Mail Using : " + JSON.stringify(transportOptions));
     sails.log.debug("Sending Mail with Options : " + JSON.stringify(mailOptions));
     return transporter.sendMail(mailOptions, callback);
 }

 // Allows sending email via Mailgun API.
 function sendMailgun( mailOptions, callback) {
    request.post( sails.config.mailgun.url,
    {
        'auth' : {
            user: 'api',
            pass: sails.config.mailgun.apikey
        },
        'form' : {
            'from' : mailOptions.from,
            'to': mailOptions.to,
            'subject': mailOptions.subject,
            'html': mailOptions.html
        } 
    }, callback);
}

var send;
if ( sails.config.sendMail === 'Mailgun') {
    send = sendMailgun;
} else {
    send = sendSMTP;
}
exports.sendMail = send;
