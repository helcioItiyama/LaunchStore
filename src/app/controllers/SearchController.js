const {formatPrice} = require('../../lib/utils');
const Product = require('../models/Product');

module.exports = {
    async index(req, res) {
        try {
            let {filter, category} = req.query;

            if(!filter || filter.toLowerCase == 'toda a loja') filter = null;

            results = await Product.search({filter, category})

            async function getImage(productId) {
                let result = await Product.files(productId);
                const files = result.rows.map(file => `${req.protocol}://${req.headers.host}${file.path.replace("public\\images\\", "\\\\images\\\\")}`);
                return files[0]
            }
          
            const productsPromise = results.rows.map(async product => {
                product.img = await getImage(product.id);
                product.oldPrice = formatPrice(product.old_price);
                product.price = formatPrice(product.price);
                return product
            })

            const products = await Promise.all(productsPromise)

            const search = {
                term: filter || 'toda a loja',
                total: products.length
            }

            const categories = products.map(product => ({
                id: product.category_id,
                name: product.category_name
            })).reduce((categoriesFiltered, category) => {
                const found = categoriesFiltered.some(cat => cat.id == category.id)
               
                if (!found) categoriesFiltered.push(category)
                
                return categoriesFiltered
            }, [])

            return res.render("search/index", {products, search, categories})

        } catch(err) {
            console.log(err)
        }
    }

}
