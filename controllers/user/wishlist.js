const userHelpers = require("../../helpers/user-helpers");

exports.wishlistview = async (req, res) => {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = await userHelpers.getCartCount(userId);
  userHelpers.getWishlistProducts(userId).then((response) => {
    // console.log(response.product);
    res.render("user/wishlist", { user, userId, response, cartCount });
  });
}


exports.addtoWishlist = (req, res) => {
  userHelpers
    .addToWishlist(req.params.proId, req.session.user._id)
    .then(() => {
      res.json({ status: true });
    })
    .catch((response) => {
      res.json({ status: false });
    });
}

exports.deleteWishlist = (req, res) => {
  console.log(req.params.id,'aaaaaaaaaaaaaaa');
  userHelpers
    .deleteWishProduct(req.params.id, req.session.user._id)
    .then(() => {
      res.redirect("/wishlist");
    });
}

