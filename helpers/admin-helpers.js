const db = require("../config/connection");
const collection = require("../config/collection");
const bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectId;
require('dotenv').config()

module.exports = {
  //Admin Sign in
  adminSignin: (adminData) => {
    let response = {};
    // console.log(adminData);
    return new Promise(async (resolve, reject) => {
      let admin = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ email: adminData.email });
      //   console.log(admin);
      if (admin && admin.status) {
        bcrypt.compare(adminData.password, admin.password).then((status) => {
          if (status) {
            response.admin = admin;
            response.status = true;
            resolve(response);
          } else {
            reject("Invalid password");
          }
        });
      } else {
        reject("Invalid email");
      }
    });
  },

  //add category
  addCategory: (categorydata) => {
    return new Promise(async (resolve, reject) => {
      categorydata.category = categorydata.category.toUpperCase();
      categorydata.date = new Date();
      let categoryCheck = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ category: categorydata.category });
      if (categoryCheck == null) {
        db.get()
          .collection(collection.CATEGORY_COLLECTION)
          .insertOne(categorydata)
          .then((response) => {
            resolve(response.insertedId);
          });
      }
      else {
        reject("Category Already Exists");
      }
    });
  },

  //Get Categories in category page
  getCategory: () => {
    return new Promise(async (resolve, reject) => {
      let category = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find({})
        .sort({ date: -1 })
        .toArray();
      resolve(category);
    });
  },

  // DELETE CATEGORY
  deleteCategory: (catId) => {
    return new Promise((resolve, reject) => {
      console.log(catId);
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .deleteOne({ _id: objectId(catId) })
        .then((response) => {
          resolve();
        });
    });
  },


  //-------------------------PAGINATION------------------------
  pagination: (COLLECTION) => {
    return new Promise(async (resolve, reject) => {
      const limit = 5
      let totalItems = await db
        .get()
        .collection(COLLECTION)
        .find()
        .toArray();
      let totalCount = totalItems.length
      const pageCount = totalCount / limit
      let p = Math.ceil(pageCount)
      let pages = []
      for (let i = 1; i <= p; i++) {
        pages.push(i)
      }
      resolve(pages)
    })
  },

  //USERS DISPLAYING ON ADMIN SIDE
  getAllUsers: (pageNo) => {
    return new Promise(async (resolve, reject) => {
      let users
      const limit = 5
      users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find().skip(pageNo * limit).limit(limit)
        .toArray();
      resolve(users);
    });
  },

  // USER BLOCKING AND UNBLOCKING
  changeUserStatus: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne({ _id: objectId(userId) }, [
          { $set: { status: { $not: "$status" } } },
        ]);
      resolve("Success");
    });
  },

  //ORDER DETAILS
  getOrderDetails: (pageNo) => {
    return new Promise(async (resolve, reject) => {
      let orderItems
      const limit = 5
      const skip = pageNo * limit
      orderItems = await db.get().collection(collection.ORDER_COLLECTION).find({}).toArray()
      // .aggregate([

      //   {
      //     $unwind: '$products'
      //   },
      //   {
      //     $project: {
      //       item: '$products.item',
      //       quantity: '$products.quantity',
      //       deliveryDetails: '$deliveryDetails',
      //       paymentMethod: '$paymentMethod',
      //       totalAmount: '$totalAmount',
      //       prodstatus: '$products.status',
      //       offerprice: '$products.offerprice',
      //       date: '$date',
      //       status:1,
      //       coupon:1
      //     }
      //   }, {
      //     $lookup: {
      //       from: collection.PRODUCT_COLLECTION,
      //       localField: 'item',
      //       foreignField: '_id',
      //       as: 'product'
      //     }
      //   },
      //   {
      //     $project: {
      //       item: 1,
      //       quantity: 1,
      //       product: { $arrayElemAt: ['$product', 0] },
      //       deliveryDetails: 1,
      //       paymentMethod: 1,
      //       totalAmount: 1,
      //       status: 1,
      //       prodstatus:1,
      //       date: 1,
      //       offerprice: 1,
      //       coupon:1
      //     }
      //   },
      //   {
      //     $sort:{
      //       date:-1
      //     }
      //   },

      // ]).toArray()
      resolve(orderItems)
    })
  },

  //ORDER STATUS
  changeOrderStatus: (orderId, status, prodId) => {
    return new Promise((resolve, reject) => {
      let dateStatus = new Date()
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId), 'products.item': objectId(prodId) },
        { $set: { 'products.$.status': status, 'products.$.statusUpdateDate': dateStatus } }).then(() => {
          resolve()
        })
    })
  },

  changeStatus: (orderId, status) => {
    return new Promise((resolve, reject) => {
      console.log(orderId, 44444444444444444444);
      let dateStatus = new Date()
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
        { $set: { status: status, date: dateStatus } }).then(() => {
          resolve()
        })
    })
  },

  //DASHBOARD ACC TO NO OF DAYS
  dashboardCount: (days) => {
    days = parseInt(days)
    return new Promise(async (resolve, reject) => {
      let startDate = new Date();
      let endDate = new Date();
      startDate.setDate(startDate.getDate() - days)

      let data = {};

      data.deliveredOrders = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: startDate, $lte: endDate }, 'products.status': 'delivered' }).count()
      console.log(data.deliveredOrders);
      data.shippedOrders = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: startDate, $lte: endDate }, 'status': 'shipped' }).count()
      data.placedOrders = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: startDate, $lte: endDate }, 'products.status': 'placed' }).count()
      data.pendingOrders = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: startDate, $lte: endDate }, 'products.status': 'pending' }).count()
      data.canceledOrders = await db.get().collection(collection.ORDER_COLLECTION).find({ date: { $gte: startDate, $lte: endDate }, 'products.status': 'canceled' }).count()
      console.log(data);
      let codTotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            date: {
              $gte: startDate, $lte: endDate
            },
            paymentMethod: 'COD'
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: {
              $sum: "$totalAmount"
            }
          }
        }
      ]).toArray()
      data.codTotal = codTotal?.[0]?.totalAmount
      
      let onlineTotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            date: {
              $gte: startDate, $lte: endDate
            },
            paymentMethod: 'razorpay'
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: {
              $sum: "$totalAmount"
            }
          }
        }
      ]).toArray()
      data.onlineTotal = onlineTotal?.[0]?.totalAmount
      console.log(data.onlineTotal,'111111111111111111111111111111111111111111');

      let totalAmount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            date: {
              $gte: startDate, $lte: endDate
            },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: {
              $sum: "$totalAmount"
            }
          }
        }
      ]).toArray()
      data.totalAmount = totalAmount?.[0]?.totalAmount
      console.log(data,'dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      resolve(data)
    })
  },

  //SALES REPORT
  deliveredOrderList: (yy, mm) => {
    return new Promise(async (resolve, reject) => {
      let agg = [{
        $match: {
          'products.status': 'delivered'
        }
      }, {
        $unwind: {
          path: '$products'
        }
      }, {
        $project: {
          totalAmount: '$totalAmount',
          paymentMethod: 1,
          'products.statusUpdateDate': 1,
          'products.status': 1
        }
      }]

      if (mm) {
        let start = "1"
        let end = "30"
        let fromDate = mm.concat("/" + start + "/" + yy)
        let fromD = new Date(new Date(fromDate).getTime() + 3600 * 24 * 1000)

        let endDate = mm.concat("/" + end + "/" + yy)
        let endD = new Date(new Date(endDate).getTime() + 3600 * 24 * 1000)
        dbQuery = {
          $match: {
            'products.statusUpdateDate': {
              $gte: fromD,
              $lte: endD
            }
          }
        }
        agg.unshift(dbQuery)
        let deliveredOrders = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate(agg).toArray()
        resolve(deliveredOrders)
      } else if (yy) {
        let dateRange = yy.daterange.split("-")
        let [from, to] = dateRange
        from = from.trim("")
        to = to.trim("")
        fromDate = new Date(new Date(from).getTime() + 3600 * 24 * 1000)
        toDate = new Date(new Date(to).getTime() + 3600 * 24 * 1000)
        dbQuery = {
          $match: {
            'products.statusUpdateDate': {
              $gte: fromDate,
              $lte: toDate
            }
          }
        }
        agg.unshift(dbQuery)
        let deliveredOrders = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate(agg).toArray()
        resolve(deliveredOrders)
      } else {
        let deliveredOrders = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate(agg).toArray()
        resolve(deliveredOrders)
      }
    })
  },

  //------------------COUPON MANAGEMENT--------------------
  getAllCoupons: () => {
    return new Promise(async (resolve, reject) => {
      let coupons = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
      resolve(coupons)
    })
  },

  addCoupon: (data) => {
    data.coupon = data.coupon.toUpperCase()
    data.couponOffer = Number(data.couponOffer)
    data.minPrice = Number(data.minPrice)
    data.maxPrice = Number(data.maxPrice)
    data.expDate = new Date(data.expDate)
    return new Promise(async (resolve, reject) => {
      let couponExists = await db.get().collection(collection.COUPON_COLLECTION).findOne({
        coupon: data.coupon
      })
      if (couponExists == null) {
        db.get().collection(collection.COUPON_COLLECTION).insertOne(data)
          .then(() => {
            resolve()
          })
      } else {
        console.log('Rejected');
        reject();
      }

    })
  },
  deleteCoupon: (coupons) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.COUPON_COLLECTION).deleteOne({ coupon: coupons }).then(() => {
        resolve()
      })
    })
  },

  //--------------------------------ADD IMAGES TO BANNER COLLECTION----------------------------------
  addBanner: (data, urls) => {
    return new Promise((resolve, reject) => {
      data.image = urls
      db.get().collection(collection.BANNER_COLLECTION).insertOne(data).then(() => {
        resolve()
      })
    })
  },

  getBanner: () => {
    return new Promise(async (resolve, reject) => {
      const banners = await db.get().collection(collection.BANNER_COLLECTION).find({}).toArray()
      resolve(banners)
    })
  },



  getSearchProduct: (key, page, productsPerPage) => {
    return new Promise(async (resolve, reject) => {
      let data = await db.get().collection(collection.PRODUCT_COLLECTION).find({
        "$or": [
          { product: { $regex: key, '$options': 'i' } },
          { brand: { $regex: key, '$options': 'i' } },
          { category: { $regex: key, '$options': 'i' } },
        ]
      }).toArray()
      if (data.length > 0) {
        console.log(data, '55555555555555555555');
        resolve(data)
      } else {
        console.log('Errrrrrrrrrrrrrrrrrrr');
        reject()
      }
    })
  },


  editBanner: (urls, img) => {
    return new Promise(async (resolve, reject) => {

      let pro = await db.get().collection(collection.BANNER_COLLECTION).findOne({})
      let image1 = pro.image[0]
      let image2 = pro.image[1]
      let image3 = pro.image[2]
      let uploadImg = []
      if (img.img1) {
        uploadImg[0] = urls[0]
        if (urls == null) {

        } else {
          urls.shift()
        }
      } else {
        uploadImg[0] = image1
      }


      if (img.img2) {
        uploadImg[1] = urls[0]
        if (urls == null) {

        } else {
          urls.shift()
        }
      } else {
        uploadImg[1] = image2
      }


      if (img.img3) {
        uploadImg[2] = urls[0]
        if (urls == null) {

        } else {
          urls.shift()
        }
      } else {
        uploadImg[2] = image3
      }

      db.get()
        .collection(collection.BANNER_COLLECTION)
        .updateOne(
          { _id: objectId('6374196e4fba1ad86980067d') },
          {
            $set: {
              image: uploadImg
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  }

}

