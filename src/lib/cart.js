const {formatPrice} = require('../lib/utils');

//cart is kept on req.session
const Cart = {
    init(oldCart) {
        if(oldCart) {
            this.items = oldCart.items;
            this.total = oldCart.total;
        } else {
            this.items = [];
            this.total = {
                quantity: 0,
                price: 0,
                formattedPrice: formatPrice(0)
            }
        }
        return this
    },

    addOne(product) {
        //check if the product already exists on the cart
        let inCart = this.getCartItem(product.id);

        //if doesn't exist
        if(!inCart) {
            inCart = {
                product: {
                    ...product,
                    formattedPrice: formatPrice(product.price)
                },
                quantity: 0,
                price: 0,
                formattedPrice: formatPrice(0)
            }
            this.items.push(inCart)
        }

        //if max quantity exceeds
        if(inCart.quantity >= product.quantity) return this;

        //if not, update item
        inCart.quantity++;
        inCart.price = inCart.product.price * inCart.quantity;
        inCart.formattedPrice = formatPrice(inCart.price);

        //update cart
        this.total.quantity++;
        this.total.price += inCart.product.price;
        this.total.formattedPrice = formatPrice(this.total.price);
        return this;
    },

    removeOne(productId) {
        //get the cart item
        const inCart = this.getCartItem(productId);

        if(!inCart) return this;

        //update item
        inCart.quantity--;
        inCart.price = inCart.product.price * inCart.quantity;
        inCart.formattedPrice = formatPrice(inCart.price);

        //update cart
        this.total.quantity--;
        this.total.price -= inCart.product.price;
        this.total.formattedPrice = formatPrice(this.total.price);

        //if cart is empty
        if(inCart.quantity < 1) {
            this.items = this.items.filter(item => item.product.id != inCart.product.id);
            return this;
        }
        return this;
    },

    delete(productId) {
        const inCart = this.getCartItem(productId);
        if(!inCart) return this;

        if(this.items.length > 0) {
            this.total.quantity -= inCart.quantity;
            this.total.price -= (inCart.product.price * inCart.quantity);
            this.total.formattedPrice = formatPrice(this.total.price);
        }
        this.items = this.items.filter(item => inCart.product.id != item.product.id);
        return this;
    },

    getCartItem (productId) {
        return this.items.find(item => item.product.id == productId);
    }
} 

module.exports = Cart;