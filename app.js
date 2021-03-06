var express = require('express');
var querystring = require('querystring');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var request = require('request');
var config = require('config')
var session = require('express-session')
var saveStoreCredentials = require('./utils/saveStoreCredentials');
var webHook = require('./utils/webHook');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat' }));
app.use(express.static(path.join(__dirname, 'public')));

// Shopify Authentication

// This function initializes the Shopify OAuth Process
// The template in views/embedded_app_redirect.ejs is rendered 
app.get('/shopify_auth', function(req, res) {
    if (req.query.shop) {
        req.session.shop = req.query.shop;
        console.log('req.session.shop in  /shopify_auth function=== ' + req.session.shop);
        res.render('embedded_app_redirect', {
            shop: req.query.shop,
            api_key: config.get('oauth.api_key'),
            scope: config.get('oauth.scope'),
            redirect_uri: config.get('oauth.redirect_uri')
        });
    }
})


// After the users clicks 'Install' on the Shopify website, they are redirected here
// Shopify provides the app the is authorization_code, which is exchanged for an access token
app.get('/access_token', verifyRequest, function(req, res) {
    console.log('req in /access_token funtion ' + req);
    if (req.query.shop) {
        console.log('req.query.shop in /access_token function  = ' + req.query.shop);
        var params = {
            client_id: config.get('oauth.api_key'),
            client_secret: config.get('oauth.client_secret'),
            code: req.query.code
        }
        var req_body = querystring.stringify(params);
        console.log("req_body in /access_token ============================");
        console.log(req_body)

        request({
                url: 'https://' + req.query.shop + '/admin/oauth/access_token',
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(req_body)
                },
                body: req_body
            },
            function(err, resp, body) {
                console.log("body in access_token ==========================");
                console.log(body);
                body = JSON.parse(body);
                req.session.access_token = body.access_token;
                console.log('req.session.access_token   ====   ' + req.session.access_token);
                var shop = {};
                shop['shop'] = req.query.shop;
                shop['access_token'] = req.session.access_token
                saveStoreCredentials(shop);
                webHook.createOrder(shop);
                webHook.createCustomer(shop);
                webHook.createProduct(shop);
                req.session['shop'] = req.query.shop;
                res.redirect('/');
            })
    }
})

// // Renders the install/login form
// app.get('/install', function(req, res) {
//     req.redirect('/shopify_auth');
// })

// Renders content for a modal
app.get('/modal_content', function(req, res) {
        res.render('modal_content', {
            title: 'Embedded App Modal'
        });
    })
    // The home page, checks if we have the access token, if not we are redirected to the install page
    // This check should probably be done on every page, and should be handled by a middleware
app.get('/', function(req, res) {
    console.log('req in / get funtion ' + req);
    if (req.query.hmac) {
        console.log('req = ' + req.param);
        res.redirect('/shopify_auth/?shop=' + req.query.shop);
    } else {
        console.log('shop Name in index view===== ' + req.session.shop);
        var params = {};
        params['shop'] = req.session.shop;
        getAccessToken(params).then(success => {
            console.log("success data = " + JSON.stringify(success));
        });
        getCustomerDetails(params);
        res.render('index', {
            title: 'Home'
        });
    }
})

app.get('/add_product', function(req, res) {
    res.render('add_product', {
        title: 'Add A Product',
        api_key: config.get('oauth.api_key'),
        shop: req.session.shop,
    });
})



app.get('/products', function(req, res) {
    var next, previous, page;
    page = req.query.page ? ~~req.query.page : 1;

    next = page + 1;
    previous = page == 1 ? page : page - 1;

    request.get({
        url: 'https://' + req.session.shop + '/admin/products.json?limit=5&page=' + page,
        headers: {
            'X-Shopify-Access-Token': req.session.access_token
        }
    }, function(error, response, body) {
        if (error)
            return next(error);
        body = JSON.parse(body);
        res.render('products', {
            title: 'Products',
            api_key: config.get('oauth.api_key'),
            shop: req.session.shop,
            next: next,
            previous: previous,
            products: body.products
        });
    })
})


app.post('/getOrder', function(req, res) {
    console.log('Received shopify order ' + JSON.stringify(req.body));
    res.json(200);
});


app.post('/products', function(req, res) {
    data = {
        product: {
            title: req.body.title,
            body_html: req.body.body_html,
            images: [{
                src: req.body.image_src
            }],
            vendor: "Vendor",
            product_type: "Type"
        }
    }
    req_body = JSON.stringify(data);
    request({
        method: "POST",
        url: 'https://' + req.session.shop + '/admin/products.json',
        headers: {
            'X-Shopify-Access-Token': req.session.access_token,
            'Content-type': 'application/json; charset=utf-8'
        },
        body: req_body
    }, function(error, response, body) {
        if (error)
            return next(error);
        body = JSON.parse(body);
        if (body.errors) {
            return res.json(500);
        }
        res.json(201);
    })
})

function verifyRequest(req, res, next) {
    var map = JSON.parse(JSON.stringify(req.query));
    delete map['signature'];
    delete map['hmac'];
    var message = querystring.stringify(map);
    var generated_hash = crypto.createHmac('sha256', config.get('oauth.client_secret')).update(message).digest('hex');
    if (generated_hash === req.query.hmac) {
        next();
    } else {
        return res.json(400);
    }
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
var port = process.env.PORT || 3000;
app.listen(port);
// var server_ip_address = '127.0.0.1';
// app.set('port', process.env.PORT || 3000);
// var server = app.listen(app.get('port'), server_ip_address, function() {
//     console.log('Express server listening on port ' + server.address().port);
// });

module.exports = app;