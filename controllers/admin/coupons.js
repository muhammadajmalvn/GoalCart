const adminHelpers = require("../../helpers/admin-helpers");


exports.getCoupons = async (req, res) => {
    adminHelpers.getAllCoupons().then((coupons) => {
      res.render('admin/coupons', { coupons, admin: "true" })
    })
  }

  exports.addCoupon = (req, res) => {
    console.log(req.body);
    adminHelpers.addCoupon(req.body).then((response) => {
      res.json({ status: true })
    }).catch(() => {
      console.log('Failed to add coupon');
      res.json({ status: false })
    })
  }

  exports.deleteCoupon = (req, res) => {
    console.log(req.body.coupon);
    adminHelpers.deleteCoupon(req.body.coupon).then(() => {
      res.json({ success: true })
    })
  }