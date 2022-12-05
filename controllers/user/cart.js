const userHelpers = require("../../helpers/user-helpers");
const productHelpers = require("../../helpers/product-helpers");

exports.viewCart = async (req, res) => {
  let user = req.session.user;
  let userId = req.session.user._id;
  let products = await userHelpers.getCartProducts(userId);
  // console.log(products, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  let cartCount = await userHelpers.getCartCount(userId);
  let totalAmount = await userHelpers.getTotalAmount(userId);
  console.log(user, totalAmount, '444444555555')
  res.render("user/cart", { products, user, userId, cartCount, totalAmount });
}

exports.addtoCart = (req, res) => {
  console.log("Button clicked");
  console.log(req.params.id);
  let user = req.session.user;
  console.log(user._id);
  userHelpers.addToCart(req.params.id, user._id).then((response) => {
    res.json({ status: true });
  });
}

exports.changeQuantity = (req, res) => {
  let itemQuantity = parseInt(req.body.count) + parseInt(req.body.quantity)
  console.log(itemQuantity);
  productHelpers.getStockCount(req.body.product).then((productstock) => {
    // console.log("aaaaaaaaaaaaaaaaaaaaaaa", productstock);
    if (productstock >= itemQuantity) {
      // console.log('gggggdddddddddddddddddddddddddddd');
      userHelpers.changeProductQuantity(req.body).then(async (response) => {
        response.total = await userHelpers.getTotalAmount(req.body.user); //user is passed from ajax in order to reload total amount without refreshing
        response.subtotal = await userHelpers.getSubtotalAmount(req.body.user, req.body.product);
        console.log(response)
        res.json(response);
      });
    } else {
      res.json({ status: false })
    }
  })
}

exports.deleteCartProduct = (req, res) => {
  userHelpers
    .deleteCartProduct(req.params.id, req.session.user._id)
    .then((response) => {
      res.redirect("/cart");
    });
}