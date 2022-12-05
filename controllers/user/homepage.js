const userHelpers = require("../../helpers/user-helpers");
const productHelpers = require("../../helpers/product-helpers");
const adminHelpers = require("../../helpers/admin-helpers")


exports.homepage = async function (req, res) {
    let user = req.session.user;
    let cartCount = await userHelpers.getCartCount(req.session.user._id);
    let banner = await adminHelpers.getBanner()
    let Products = await productHelpers.getProducts()
  
    let wishlist = await userHelpers.wishlistItems(user._id)
  
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
    res.render("user/landing", { Products, cartCount, user, banner });
  
  }