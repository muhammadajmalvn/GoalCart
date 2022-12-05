const userHelpers = require("../../helpers/user-helpers");
const productHelpers = require("../../helpers/product-helpers");
const adminHelpers = require("../../helpers/admin-helpers")

exports.productsview = async function (req, res) {
    let cartCount = await userHelpers.getCartCount(req.session.user._id);
    let Products = await productHelpers.getProducts()
        let user = req.session.user;
        let wishlist = await userHelpers.wishlistItems(user._id)
      console.log(user);
  
    if (wishlist) {
      if (wishlist[0].products.length > 0) {
        for(let i=0;i<Products.length;i++){
          for(let j=0;j<wishlist[0].products.length;j++){
            let productId= Products[i]._id.toString()
            let item = wishlist[0].products[j].item.toString()
            if(productId===item){
              Products[i].wishlist='true'
            }
          }
        }
      }
    }
      adminHelpers.getCategory().then((category) => {
        if (Products.CategoryOfferPrice > Products.productOfferPrice) {
          res.render("user/products", { Products, cartCount, user, offerprice, category });
        }
        else {
          res.render("user/products", { Products, cartCount, user, category });
  
        }
      })
  }

  //----------------------ENABLING PRODUCT SEARCH----------------------------------------
  exports.productsearch = async function (req, res, next) {
    console.log(req.query.search, "0000000000000000");
    let user = req.session.user
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    adminHelpers.getSearchProduct(req.query.search).then((response) => {
      adminHelpers.getCategory().then((category) => {
        console.log(category);
        console.log(response);
        res.render('user/product-search', { category, response, user, cartCount })
      })
    }).catch(() => {
      console.log('Error');
      adminHelpers.getCategory().then((category) => {
        res.render('user/product-search', { category, user: req.session.user, cartCount })
      })
    })
  }