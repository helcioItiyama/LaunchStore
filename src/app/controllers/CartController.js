const Cart = require('../../lib/cart');

const LoadProductsService = require('../services/LoadProductService');

module.exports = {
    async index(req, res) {
        try {
            let {cart} = req.session;

            //cart admin
            cart = Cart.init(cart);

            return res.render('cart/index', {cart});
        } catch(error) {
            console.error(error)
        }
    },

    async addOne(req, res) {
        //get the product id and the product
        const {id} = req.params;
        const product = await LoadProductsService.load('product', {where: {id}});
        
        //get the cart from session
        let {cart} = req.session;

        //add the product to the cart (using the cart admin)
        cart = Cart.init(cart).addOne(product);

        //update cart from session
        req.session.cart = cart;

        //redirect user to the cart screen
        return res.redirect('/cart');
    },

    removeOne(req, res) {
        //get the product id
        let {id} = req.params;

        //get the cart from session
        let {cart} = req.session;
        
        //if there's no cart, return
        if(!cart) return res.redirect('/cart');

        //start the cart(cart admin)
        cart = Cart.init(cart).removeOne(id);

        //update cart from session(removing 1 item)
        req.session.cart = cart;

        //redirect to cart page
        return res.redirect('/cart');
    },

    delete(req, res) {
        let {cart} = req.session;
        let {id} = req.params
        if(!cart) return;

        req.session.cart = Cart.init(cart).delete(id);
        return res.redirect('/cart');
    }
}
