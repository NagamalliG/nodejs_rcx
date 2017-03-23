'use strict';
const Bluebird = require('bluebird');
var config = require('config');
var shopifyAPI = require('shopify-node-api');
const prepareShopifyObject = function(params) {
    return new Bluebird((resolve, reject) => {
        try {
            console.log('prepareShopifyObject called..');
            let Shopify = new shopifyAPI({
                shop: params.shop, // MYSHOP.myshopify.com 
                shopify_api_key: config.get('oauth.api_key'),
                shopify_shared_secret: config.get('oauth.client_secret'),
                access_token: params.access_token, //permanent token 
                verbose: false
            });
            resolve(Shopify);
        } catch (exception) {
            console.log('  prepareShopifyObject exception: ' + exception);
            reject(exception);
        }
    });
};
module.exports = prepareShopifyObject;