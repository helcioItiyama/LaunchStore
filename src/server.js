const express = require('express');
const nunjucks = require('nunjucks');
const routes = require('./routes');
const methodOverride = require('method-override');
const session = require('./config/session');

const server = express();

server.use(session);
server.use(express.urlencoded({extended: true})) /* faz funcionar o req.body*/
server.use(express.static('public'));
server.use(methodOverride('_method')); /*sobescreve o get para usar o método put e o delete*/
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