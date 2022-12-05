const userHelpers = require("../../helpers/user-helpers");

exports.viewProfile = async (req, res) => {
    let user = req.session.user;
    let cartCount = await userHelpers.getCartCount(user._id)
    res.render('user/profile', { user, cartCount });
  }

  exports.editProfile = (req, res) => {
    userHelpers.userEdit(req.session.user._id, req.body).then((response) => {
      req.session.user = req.body;
      res.redirect('/address');
    });
  }