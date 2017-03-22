'use strict';
const MongoClient = require('mongodb').MongoClient;
const saveStoreCredentials = function(params) {
    console.log('saveStoreCredentials ....');
    MongoClient.connect('mongodb://rcxapp:rcxapp@ds139360.mlab.com:39360/rcx_app', function(err, db) {
        if (err) {
            console.log(err);
            throw err;
        }
        var collection = db.collection('shop');
        collection.insert(params, function(err, result) {
            callback(result);
        });
    });
};
module.exports = saveStoreCredentials;