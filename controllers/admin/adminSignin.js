const adminHelpers = require("../../helpers/admin-helpers");


exports.adminLogin = function (req, res, next) {
  res.render("./admin/login",{nulls:'true'});
}

exports.adminLoginpost = (req, res) => {
  console.log(req.body);
  adminHelpers
    .adminSignin(req.body)
    .then((response) => {
      console.log(response);
      req.session.loggedIn = true;
      req.session.admin = response.admin;
      res.redirect("/admin/dashboard");
    })
    .catch((data) => {
      var strings = encodeURIComponent("Check mail id or password");
      res.redirect("/login?valid=" + strings);
    });
}

exports.adminLogout = (req, res) => {
  req.session.destroy();
  res.redirect("/admin");
}


