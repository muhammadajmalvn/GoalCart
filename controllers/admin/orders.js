const adminHelpers = require("../../helpers/admin-helpers");
const collection = require("../../config/collection");
const db = require("../../config/connection")
const objectId = require("mongodb").ObjectId;

exports.getOrders = (req, res) => {
  const pageNo = (req.query.p) ? (req.query.p - 1) : 0
  adminHelpers.pagination(collection.ORDER_COLLECTION).then((pages) => {
    adminHelpers.getOrderDetails(pageNo).then((orderItems) => {
      let admin = req.session.admin;
      console.log("ndajklkjasdhlawkywaLJjsshhh", orderItems);
      res.render("admin/orders", { admin, pages, orderItems, admin: 'true' });
    })
  })
}
exports.orderStatus = (req, res) => {
  adminHelpers.getOrderDetails(req.params.status).then((response) => {
    res.json(response)
  })
}
exports.changeOrderStatus = (req, res) => {
  console.log(req.body)
  adminHelpers.changeOrderStatus(req.body.orderId, req.body.status, req.body.proId).then(() => {
    res.json({ status: true })
  })
}


exports.changeStatus = async (req, res) => {
  console.log(req.body)
  adminHelpers.changeStatus(req.body.orderId, req.body.status).then(() => {
    res.json({ status: true })
  })
}