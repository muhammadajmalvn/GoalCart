const userHelpers = require("../../helpers/user-helpers");

exports.getOrders = async (req, res) => {
  let orders = await userHelpers.getUserOrders(req.session.user._id);
  let cartCount = await userHelpers.getCartCount(req.session.user._id);
  res.render("user/orders", { orders, user: req.session.user, cartCount });
}

exports.cancelOrder = (req, res) => {
  userHelpers.cancelOrder(req.body.orderId, req.body.proId, req.session.user._id).then((response) => {
    res.json({ status: true });
  });
}

exports.cancelOrders = (req, res) => {
  userHelpers.cancelOrders(req.body.orderId).then((response) => {
    res.json({ status: true });
  });
}

exports.invoiceView = async (req, res) => {
  let user = req.session.user
  let order = await userHelpers.getOrder(req.params.id)
  await userHelpers.getOrderPdts(req.params.id).then((response) => {
    console.log(response, '11111111111111111111111111111');
    res.render('user/invoice', { order, response, user: user })
  })
}
exports.returnProduct = async (req, res) => {
  let product = await productHelpers.getProductDetails(req.body.item)
  userHelpers.returnProduct(req.body.id, req.body.item, req.session.user._id, product).then(async (response) => {
    res.json({ status: true })
  })
    .catch(() => {
      res.json({ status: false })
    })
}

exports.returnProducts = async (req, res) => {
  let product = await productHelpers.getProductDetails(req.body.item)
  userHelpers.returnProducts(req.body.id, req.body.item, req.session.user._id, product).then(async (response) => {
    res.json({ status: true })
  })
    .catch(() => {
      res.json({ status: false })
    })
}

