const LoadProductService = require('../services/LoadProductService');
const User = require('../models/User');
const Order = require('../models/Order');
const Cart = require('../../lib/cart');
const mailer = require('../../lib/mailer');
const {formatPrice, date} = require('../../lib/utils');

const email = (seller, product, buyer) => `
    <h2>Olá ${seller.name}</h2>
    <p>Você tem um novo pedido de compra do seu produto</p>
    <p>Produto: ${product.name}</p>
    <p>Preço: ${product.formattedPrice}</p>
    <p><br/><br/></p>
    <h3>Dados do comprador</h3>
    <p>${buyer.name}</p>
    <p>${buyer.email}</p>
    <p>${buyer.address}</p>
    <p>${buyer.cep}</p>
    <p><br/><br/></p>
    <p>Entre em contato com o comprador para finalizar a venda!</strong></p>
    <p><br/><br/></p>
    <p>Atenciosamente, Equipe Launchstore</p>
`

module.exports = {
    async index(req, res) {
        //get user orders
        let orders = await Order.findAll({where: {buyer_id: req.session.userId}});
        const getOrdersPromise = orders.map(async order => {
            //product details
            order.product = await LoadProductService.load('products', {
                where: {id: order.product_id}
            })

            //buyer details
            order.buyer = await User.findOne({
                where: {id: order.buyer_id}
            })

            //seller details
            order.seller = await User.findOne({
                where: {id: order.seller_id}
            })

            //price format
            order.formattedPrice = formatPrice(order.price);
            order.formattedTotal = formatPrice(order.total);

            //status format
            const statuses = {
                open: "Aberto",
                sold: "Vendido",
                canceled: "Cancelado"
            }

            order.formattedStatus = statuses[order.status];
            //updated by...format

            const updatedAt = date(order.updated_at)
            order.formattedUpdatedAt = `${order.formattedStatus} em ${updatedAt.day}/${updatedAt.month}/${updatedAt.year} às ${updatedAt.hour}h${updatedAt.minutes}`
            return order;
        })
            orders = await Promise.all(getOrdersPromise);

        return res.render('orders/index', {orders})
    },

    async post(req, res) {
        try {
            //get the cart products
            const cart = Cart.init(req.session.cart);
            //check if buyer is not buy his own product
            const buyer_id = req.session.userId;
            const filteredItems = cart.items.filter(item => item.product.user_id != buyer_id);
            //create order
            const createOrdersPromise = filteredItems.map(async item => {
                let {product, price: total, quantity} = item;
                const {price, id: product_id, user_id: seller_id} = product;
                const status = "open";

                const order = await Order.create({
                    seller_id,
                    buyer_id,
                    product_id,
                    price,
                    total,
                    quantity,
                    status
                });
                //get products data
                product = await LoadProductService.load('product', {
                    where: {id: product_id}
                });

                //get seller data
                const seller = await User.findOne({
                    where: {id: seller_id}
                });

                //get buyer data
                const buyer = await User.findOne({
                    where: {id: buyer_id}
                });

                //send email with selling data to the seller
                await mailer.sendMail({
                    to: seller.email,
                    from: 'no-reply@launchstore.com.br',
                    subject: 'Novo pedido de compra',
                    html: email(seller, product, buyer)

                })
                return order;

            })

            await Promise.all(createOrdersPromise);

            //clear the cart
            delete req.session.cart;
            Cart.init();

            //notify buyer with a success message
            return res.render('orders/success')

        } catch(error) {
            //or error
            console.error(error)
            return res.render('orders/error')
        }
    }
}
