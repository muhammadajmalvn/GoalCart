const adminHelpers = require("../../helpers/admin-helpers");
const collection = require("../../config/collection");

exports.usersView = (req, res) => {
    let pageNo;
    if (req.query?.p) {
      pageNo = req.query.p - 1 || 0;
    }
    adminHelpers.pagination(collection.USER_COLLECTION).then((pages) => {
      adminHelpers.getAllUsers(pageNo).then((users) => {
        let admin = req.session.admin;
        res.render("admin/users", { users, pages, admin, admin: "true" });
      });
    })
  }

  exports.changeUserStatus =  function (req, res) {
    adminHelpers.changeUserStatus(req.params.id).then((response) => {
      res.redirect("/admin/users");
    });
  }

