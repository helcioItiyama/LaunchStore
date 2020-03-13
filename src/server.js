const express = require('express');
const nunjucks = require('nunjucks');
const routes = require('./routes');
const methodOverride = require('method-override');
const session = require('./config/session');

const server = express();

server.use(session); /* for private users*/
server.use((req, res, next) => {
    res.locals.session = req.session;
    next()
})

server.use(express.urlencoded({extended: true})) /* it makes req.body work*/
server.use(express.static('public'));
server.use(methodOverride('_method')); /*override the GET method to PUT and DELETE method*/
server.use(routes);

server.set("view engine", "njk");

nunjucks.configure("src/app/views", {
    express: server,
    autoescape: false,
    noCache: true
})

server.listen(5000, () => {
    console.log('server is running')
}); 