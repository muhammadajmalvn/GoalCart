const userHelpers = require("../../helpers/user-helpers");

exports.walletView = async (req, res) => {
  let userId = req.session.user._id
  let user = req.session.user
  let cartCount = await userHelpers.getCartCount(userId)
  let wallet = await userHelpers.wallet(userId)
  let walletamt = await userHelpers.walletAmount(userId)
  res.render('user/wallet', { user, cartCount, wallet, walletamt })
}