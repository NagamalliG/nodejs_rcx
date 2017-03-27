'use strict';
var config = require('config');
const Bluebird = require('bluebird');
const MongoClient = require('mongodb').MongoClient;
var dbConfig = config.get('shop.dbConfig');
const getAccessToken = function(params) {
    return new Bluebird((resolve, reject) => {
        var dbUrl = dbConfig.host + dbConfig.port + dbConfig.dbName;
        MongoClient.connect(dbUrl, function(err, db) {
            if (err) {
                console.log(err);
                throw err;
            }
            db.collection('shop').find({ "shop": params['shop'] }, function(err, data) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    });
};
module.exports = getAccessToken;