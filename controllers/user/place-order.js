const userHelpers = require("../../helpers/user-helpers");


exports.addAddressCheckout = (req, res) => {
  userHelpers.addAddress(req.session.user._id, req.body).then((response) => {
    res.redirect('/place-orders')
  })
}

exports.placeOrder = async (req, res) => {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartProduct = await userHelpers.getCartProducts(userId);
  let total = await userHelpers.getTotalAmount(userId);
  let address = await userHelpers.getAddress(userId)
  let cartCount = await userHelpers.getCartCount(userId);
  res.render("user/checkout", { cartProduct, total, user, userId, address, cartCount });
}


exports.placeOrderPost = async (req, res) => {
  let userId = req.session.user._id
  // let products = await userHelpers.getCartProductList(userId);
  console.log(req.body);
  let products = await userHelpers.getCartProducts(userId);
  let totalPrice = req.body.totalfinal;
  let coupon
  let userAddress = await userHelpers.getOrderAddress(userId, req.body.addressId)
  let wallet = await userHelpers.walletAmount(userId);
  let payment = req.body.paymentMethod
  if(req.body.coupon){
    coupon = req.body.coupon
  }
  if (payment === "COD") {
    userHelpers.placeOrder(req.body.paymentMethod, userId,
      products, totalPrice, userAddress, wallet,coupon)
      .then((orderId) => {
        res.json({ codSuccess: true })
      });
  }
  else if (payment === "razorpay") {
    userHelpers.placeOrder(req.body.paymentMethod, userId,
      products, totalPrice, userAddress, wallet,coupon)
      .then((orderId) => {
        console.log("HHhjdkjsaalasaas", orderId);
        userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
          res.json(response)
        });
      });
  }
  else {
    userHelpers.walletPurchase(userId, wallet, totalPrice).then((response) => {
      userHelpers.placeOrder(req.body.paymentMethod, userId,
        products, totalPrice, userAddress, wallet,coupon)
        .then((orderId) => {
          res.json({ walletSuccess: true })
        });
    }).catch((err) => {
      res.json({ walletFailure: true })
    })
  }
}

exports.verifyPayment = (req, res) => {

  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      console.log('payment successful');
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err);
    res.json({ status: false })
  })
}