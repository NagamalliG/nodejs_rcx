'use strict';
var config = require('config');
const MongoClient = require('mongodb').MongoClient;

var dbConfig = config.get('shop.dbConfig');



const saveStoreCredentials = function(params) {
    console.log('db config details ' + JSON.stringify(dbConfig));
    var dbUrl = dbConfig.host + dbConfig.port + dbConfig.dbName;
    console.log('saveStoreCredentials ....' + dbUrl);
    MongoClient.connect(dbUrl, function(err, db) {
        if (err) {
            console.log(err);
            throw err;
        }
        var collection = db.collection('shop');
        collection.insert(params, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
            }
        });
    });
};
module.exports = saveStoreCredentials;