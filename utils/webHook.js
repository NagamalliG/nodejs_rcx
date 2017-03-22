var shopifyAPI = require('shopify-node-api');
var config = require('config');

const createOrder = function(params) {
    var Shopify = new shopifyAPI({
        shop: params.shop, // MYSHOP.myshopify.com 
        shopify_api_key: config.get('oauth.api_key'),
        shopify_shared_secret: config.get('oauth.client_secret'),
        access_token: params.access_token, //permanent token 
        verbose: false
    });

    var post_data = {
        "webhook": {
            "topic": "orders/create",
            "address": config.get('app_url') + '/getOrder',
            "format": "json"
        }
    }
    Shopify.post('/admin/webhooks.json', post_data, function(err, data, headers) {
        console.log(data);
    });
};

module.exports = { createOrder: createOrder };