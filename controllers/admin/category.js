const adminHelpers = require("../../helpers/admin-helpers");


exports.categoryView = (req, res) => {
    adminHelpers.getCategory().then((category) => {
        // let admin = req.session.admin;
        res.render("admin/category", { admin: "true", category });
    });
}

exports.categoryAdd = (req, res) => {
    console.log(req.body);
    adminHelpers
        .addCategory(req.body)
        .then(() => {
            adminHelpers.getCategory().then((category) => {
                // let admin = req.session.admin;
                res.render("admin/category", { admin: "true", category });
            })
        })
        .catch((err) => {
            console.log(err);
            adminHelpers.getCategory().then((category) => {
                // let admin = req.session.admin;
                res.render("admin/category", { admin: "true", category, err: "true" });
            });

        });
}

exports.categoryDelete = (req, res) => {
    let catId = req.params.id;
    console.log(catId);
    adminHelpers
        .deleteCategory(catId)
        .then((response) => res.redirect("/admin/category"));
}