const Order = require('../models/Order');
const User = require('../models/User');

const LoadProductService = require('./LoadProductService');

const {formatPrice, date} = require('../../lib/utils');


async function format(order) {
   //product details
   order.product = await LoadProductService.load('productWithDeleted', {
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
}

const LoadService = {
    load(service, filter) {
        this.filter = filter;
        return this[service]() //when uses this.filter = filter you don't need to write this[service](filter)
    },

    async order() {
        try {
            let order = await Order.findOne(this.filter);
            return format(order)
        } catch(error) {
            console.error(error)
        }
    },

    async orders() {
        try {
            const orders = await Order.findAll(this.filter);
            const ordersPromise = orders.map(format)
            return Promise.all(ordersPromise)
        } catch(error) {
            console.error(error)
        }
    },

    format

}

module.exports = LoadService;