'use strict';
const Bluebird = require('bluebird');
var config = require('config');
var shopifyAPI = require('shopify-node-api');
const getCustomerDetails = function(params) {
    return new Bluebird((resolve, reject) => {
        try {

            resolve('Shopify');
        } catch (exception) {
            console.log('  getCustomerDetails exception: ' + exception);
            reject(exception);
        }
    });
};
module.exports = getCustomerDetails;