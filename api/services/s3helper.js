/**
 * Created by chuckf on 5/8/14.
 *
 * Service to work with Amazon s3
 */


var locals = require('../../config/local');
var knox = require('knox');
// export this to sails
exports.s3 =  {

    remove : function( objectKey ) {
        var client = knox.createClient({
            key: locals.s3AccessKey,
            secret: locals.s3SecretKey,
            bucket: locals.s3DefaultBucket
        });

        client.del(objectKey).on('response', function(res){
            console.log(res.statusCode);
            console.log(res.headers);
        }).end();

    }

}
