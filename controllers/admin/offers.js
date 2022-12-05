const adminHelpers = require("../../helpers/admin-helpers");
const productHelpers = require("../../helpers/product-helpers");


exports.getCategoryOffer = (req, res) => {
    adminHelpers.getCategory().then((category) => {
        res.render('admin/categoryoffer', { admin: true, category })
    })
}

exports.categoryOffer = (req, res) => {
    // console.log("posttttttttttttttttttttttttt");
    console.log(req.body);
    let discount = parseInt(req.body.discountvalue);
    let category = req.body.category;
    productHelpers.categoryOffer(discount, category).then((response) => {
        // console.log("fffffffffffffffff", response)
        productHelpers.offerPriceCalctn(category)
        res.json(discount)
    })
}

exports.getProductOffer = (req, res) => {
    productHelpers.getProducts().then((products) => {
        console.log(products, 'prodoffer')
        res.render('admin/prodoffer', { products, admin: "true" });
    })
}

exports.productOffer = (req, res) => {
    // console.log(req.body);
    let productdiscount = parseInt(req.body.productdiscount);
    let product = req.body.product;
    productHelpers.productOffer(productdiscount, product).then(() => {
        productHelpers.offerPriceCalc(product)
        res.json(productdiscount)
    })

}
