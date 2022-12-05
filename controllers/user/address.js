const userHelpers = require("../../helpers/user-helpers");

exports.addAddress = (req, res) => {
    userHelpers.addAddress(req.session.user._id, req.body).then((response) => {
      console.log('00000000', response)
      res.redirect('/profile')
    })
  }

  exports.viewAddresses = async (req, res) => {
    const user = req.session.user
    const userId = req.session.user._id
    const cartCount = await userHelpers.getCartCount(userId)
    const address = await userHelpers.getAddress(userId)
    res.render('user/address', { user, userId, address, cartCount })
  }

  exports.deleteAddress = (req, res) => {
    userHelpers.deleteAddress(req.params.id, req.session.user._id).then((response) => {
      res.redirect('/address')
    })
  }
