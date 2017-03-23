var shopifyAPI = require('shopify-node-api');
var config = require('config');
var prepareShopifyObject = require('./prepareShopifyObject');
const createOrder = function(params) {
    prepareShopifyObject(params).then(shopifyobj => {
        var post_data = {
            "webhook": {
                "topic": "orders/create",
                "address": config.get('webHookHost') + config.get('orderWebHookEndPoint'),
                "format": "json"
            }
        }
        shopifyobj.post('/admin/webhooks.json', post_data, function(err, data, headers) {
            console.log(data);
        });
    }).catch(err => {
        console.log('err in createOrder :' + err);
    });
};
const createCustomer = function(params) {
    prepareShopifyObject(params).then(shopifyobj => {
        var post_data = {
            "webhook": {
                "topic": "customers/create",
                "address": config.get('webHookHost') + config.get('customerWebHookEndPoint'),
                "format": "json"
            }
        }
        shopifyobj.post('/admin/webhooks.json', post_data, function(err, data, headers) {
            console.log(data);
        });
    }).catch(err => {
        console.log('err in createCustomer :' + err);
    });
};
const createProduct = function(params) {
    prepareShopifyObject(params).then(shopifyobj => {
        var post_data = {
            "webhook": {
                "topic": "products/create",
                "address": config.get('webHookHost') + config.get('productWebHookEndPoint'),
                "format": "json"
            }
        }
        shopifyobj.post('/admin/webhooks.json', post_data, function(err, data, headers) {
            console.log(data);
        });
    }).catch(err => {
        console.log('err in createCustomer :' + err);
    });
};
module.exports = {
    createOrder: createOrder,
    createCustomer: createCustomer,
    createProduct: createProduct
};