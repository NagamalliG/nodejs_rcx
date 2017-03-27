'use strict';
var config = require('config');
var underscore = require('underscore');
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
        var count = 0;
        var collection = db.collection('shop');
        var document1 = db.collection('shop').find({ "shop": params['shop'] });
        document1.each(function(err, doc) {
            if (underscore.isEmpty(doc)) {
                if (count == 0) {
                    console.log('there are no documents ................');
                    collection.insert(params, function(err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(result);
                        }
                    });
                } else {
                    console.log('the document already inserted..');
                }
            } else {
                count = count + 1;
                console.log('scriptData  ' + JSON.stringify(doc));
                collection.update({ "shop": params['shop'] }, { $set: { "access_token": params['access_token'] } }, { multi: true });
            }
        });
    });
};
module.exports = saveStoreCredentials;