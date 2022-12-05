const userHelpers = require("../../helpers/user-helpers");

exports.viewPassword = async (req, res) => {
    user = req.session.user
    let cartCount = await userHelpers.getCartCount(user._id)
    res.render('user/password', { user, cartCount })
  }
  exports.changePassword = (req, res) => {
    let userId = req.session.user._id
    userHelpers.changePassword(userId, req.body).then((response) => {
      req.session.user = null
      res.redirect('/login')
    })
  }