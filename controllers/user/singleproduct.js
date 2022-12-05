const userHelpers = require("../../helpers/user-helpers");
const productHelpers = require("../../helpers/product-helpers");

exports.productdetails = async (req, res) => {
    let user = req.session.user;
    let cartCount = null;
    if (user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id);
    }
    productHelpers.getProductDetails(req.params.id).then((response) => {
      res.render("user/product-details", { response, user, cartCount });
    });
  }