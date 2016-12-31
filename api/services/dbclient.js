/**
 * Created by chuckf on 5/8/14.
 *
 * Define our DB Client - Allows us to define it in one location and make it available to our controllers
 * Client supports connection pooling.
 */
var local = require('../../config/local');
var dbclient = {
    id : "dbclient"
};
// exposed Databases
//var ks, geo, neocard;
//var mbox;
//var MongoClient = require('mongodb').MongoClient;

var OrientDB = require("orientjs");
//var dbConfig = {
//    user_name: "mbuser",
//    user_password: "re5subm"
//};

var dbConfig = {
  host: "localhost",
  port: 2424,
  httpPort: 2480,
  username: "root",
  password: "clobber8"
}

var orientdb = OrientDB(dbConfig);
//var serverConfig = {
//    host: "localhost",
//    port: 2424
//};
//var server = new Server(serverConfig);
//var db = new Db("MusicBox", server, dbConfig);
var db = orientdb.use('MusicBox');
console.log('dbclient db:'+db);
//db.open(function(err) {
// 
//    if (err) {
//        console.log(err);
//        return;
//    }
// 
//    console.log("Database '" + db.databaseName + "' has " + db.clusters.length + " clusters");
// 
//    // use db.command(...) function to run OrientDB SQL queries 
//});

//// connect and assign db's
//MongoClient.connect('mongodb://'+local.connections.mongo.user+':'+
//                                 local.connections.mongo.password+'@'+
//                                 local.connections.mongo.host+':'+
//                                 local.connections.mongo.port+'/KS?maxPoolSize='+
//                                 local.connections.mongo.maxPoolSize + '&slaveOk=true',
//    function(err, db) {
//        if(err) throw err;
//        ks = db;
//        geo = db.db('geo');
//        neocard = db.db('neocard');
//    }
//);

//// export this to sails
//exports.db = function() {
//    dbclient.ks = ks;
//    dbclient.geo = geo;
//    dbclient.neocard = neocard;
//
//    return dbclient;
//}
dbclient.mbox = db;
console.log('dbclient exporting mbox :'+db);

// export this to sails
module.exports = dbclient;
//    function() {
//    dbclient.mbox = db;
//    console.log('dbclient exporting mbox :'+db);
////    dbclient.geo = geo;
////    dbclient.neocard = neocard;
//    return dbclient;
//}





