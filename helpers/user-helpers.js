const db = require("../config/connection");
const collection = require("../config/collection");
const bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectId;
const ObjectId = require("mongodb").ObjectId;
require('dotenv').config()
const Razorpay = require("razorpay");
const { response } = require("../app");

const instance = new Razorpay({
  key_id: 'rzp_test_F6WOMA8GfzTV9U',
  key_secret: "0tmFuv9WVV3mUIi6nRlhVVkk",
});
module.exports = {

  //--------------- USER SIGN UP----------------------------


  userSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      let emailChecking = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email })
      // console.log(emailChecking)
      if (emailChecking == null) {
        userData.status = true
        userData.password = await bcrypt.hash(userData.password, 10);
        userData.referralId = userData.fname + new objectId().toString().slice(2, 8)
        // console.log(userData);

        db.get()
          .collection(collection.USER_COLLECTION)
          .insertOne(
            {
              firstName: userData.fname,
              lastName: userData.lname,
              email: userData.email,
              phonenumber: userData.phonenumber,
              password: userData.password,
              referralId: userData.referralId,
              status: userData.status
            }
          ).then((data) => {
            // console.log(data);
            db.get().collection(collection.WALLET_COLLECTION).insertOne(
              {
                userId: data.insertedId,
                walletBalance: parseInt(0),
                referalId: userData.referralId,
                transaction: []
              }
            )
            let wishlistObject = {
              user: objectId(data.insertedId),
              products: [],
            };
            db.get()
              .collection(collection.WISHLIST_COLLECTION)
              .insertOne(wishlistObject)
            resolve(userData)
          })
      }
      else {
        reject('This email address is already registered')
      }

      if (userData.referralCode) {
        //  console.log('Hiiiiiiiiiiiiiiiiiiiiiiiiiiiii')
        db.get().collection(collection.USER_COLLECTION).findOne(
          { referralId: userData.referralCode })
          .then(async (response) => {

            const obj1 = {
              orderId: new ObjectId(),
              date: new Date().toDateString(),
              mode: "Credit",
              type: "Refferal signup Offer",
              amount: 100,
            }


            await db.get().collection(collection.WALLET_COLLECTION).updateOne(
              { referalId: userData.referralId }, { $set: { walletBalance: 100 }, $push: { transaction: obj1 } })




            const obj2 = {
              orderId: new ObjectId(),
              date: new Date().toDateString(),
              mode: "Credit",
              type: "Refferal Offer",
              amount: 100,
            }
            await db.get().collection(collection.WALLET_COLLECTION).updateOne({ referalId: userData.referralCode }, { $inc: { walletBalance: 100 }, $push: { transaction: obj2 } })

          })
      }
    })
  },

  // User login
  userSignin: (userData) => {
    let response = {};
    console.log(userData);
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });
      console.log(user);
      if (user && user.status) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            response.user = user;
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


  otpLogin: (phonenumber) => {
    console.log(phonenumber)
    let response = {}
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collection.USER_COLLECTION).findOne(
        { phonenumber: phonenumber })
      if (user) {
        response.user = user
        response.status = true
        resolve(response)
      } else {
        console.log("No user with that mobile device");
        resolve({ status: false })
      }

    })
  },

  //------------------------------ADD TO CART---------------------------------------------------
  addToCart: (prodId, userId) => {
    let prodObj = {
      item: objectId(prodId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let prodExists = userCart.products.findIndex(
          (product) => product.item == prodId
        );
        console.log(prodExists);
        if (prodExists != -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(prodId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: prodObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObject = {
          user: objectId(userId),
          products: [prodObj],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObject)
          .then((response) => {
            count = 0;
            resolve(count);
          });
      }
    });
  },

  //---------------GET CART PRODUCTS FROM CART---------------------------
  getCartProducts: (userId) => {
    console.log(userId);
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate(
          //   [
          //   {
          //     $match: { user: objectId(userId) },
          //   },
          //   {
          //     $unwind: { path: "$products" },
          //   },
          //   {
          //     $project: {
          //       item: "$products.item",
          //       quantity: "$products.quantity",
          //     },
          //   },
          //   {
          //     $lookup: {
          //       from: collection.PRODUCT_COLLECTION,
          //       localField: "item",
          //       foreignField: "_id",
          //       as: "product",
          //     },
          //   },
          //   {
          //     $project: {
          //       item: 1,
          //       quantity: 1,
          //       product: { $arrayElemAt: ["$product", 0] },
          //     },
          //   },
          //   {
          //     $project: {
          //       item: 1,
          //       quantity: 1,
          //       product: 1,

          //     },
          //   },
          // ]
          [
            {
              '$match': {
                'user': objectId(userId)
              }
            }, {
              '$unwind': {
                'path': '$products'
              }
            }, {
              '$project': {
                'quantity': '$products.quantity',
                'item': '$products.item'
              }
            }, {
              '$lookup': {
                'from': 'product',
                'localField': 'item',
                'foreignField': '_id',
                'as': 'cartpdts'
              }
            }, {
              '$project': {
                '_id': 1,
                'quantity': 1,
                'item': 1,
                'product': {
                  '$arrayElemAt': [
                    '$cartpdts', 0
                  ]
                }
              }
            }, {
              '$project': {
                '_id': 1,
                'quantity': 1,
                'item': 1,
                'product': '$product.product',
                'brand': '$product.brand',
                'stock': '$product.stock',
                'category': '$product.category',
                'description': '$product.description',
                'date': '$product.date',
                'image': '$product.image',
                'actualprice': '$product.actualprice',
                'offerprice': '$product.offerprice',

              }
            },
            {
              '$project': {
                '_id': 1,
                'quantity': 1,
                'item': 1,
                'product': 1,
                'brand': 1,
                'stock': 1,
                'category': 1,
                'description': 1,
                'date': 1,
                'image': 1,
                'actualprice': 1,
                'offerprice': 1,
                'subtotal': { $multiply: [{ $toInt: "$quantity" }, { $toInt: "$offerprice" }] }
              }
            }
          ]
        )
        .toArray();
      resolve(cartItems);
    });
  },

  //CART COUNT
  getCartCount: (userId) => {
    let count = 0;
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },

  //-----------CHANGE QUANTITY OF PRODUCT---------------------------

  changeProductQuantity: (details) => {
    count = parseInt(details.count);
    quantity = parseInt(details.quantity);
    return new Promise((resolve, reject) => {
      // Removing the item from cart when quantity is one and when - button is clicked
      if (count == -1 && quantity == 1) {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { _id: objectId(details.cart) },
            {
              $pull: { products: { item: objectId(details.product) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {
              _id: objectId(details.cart),
              "products.item": objectId(details.product),
            },
            {
              $inc: { "products.$.quantity": count },
            }
          )
          .then((response) => {
            resolve({ status: true });
          });
      }
    });
  },

  //DELETE CART PRODUCT
  deleteCartProduct: (prodId, userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          {
            user: objectId(userId),
          },
          {
            $pull: { products: { item: objectId(prodId) } },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  //------------------------- GET TOTAL AMOUNT------------------
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate(
          [
            {
              $match: { user: objectId(userId) },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
              },
            },
            {
              $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: "item",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$product", 0] },
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply: [
                      { $toInt: "$quantity" },
                      { $toInt: "$product.offerprice" },
                    ],
                  },
                },
              },
            },
          ]
        )
        .toArray();
      console.log(total[0]?.total);
      resolve(total[0]?.total);
    });
  },
  getSubtotalAmount: (userId, product) => {
    return new Promise(async (resolve, reject) => {
      let subtotal = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate(
          [
            {
              '$match': {
                'user': objectId(userId)
              }
            }, {
              '$unwind': {
                'path': '$products'
              }
            },
            {
              '$match': {
                "products.item": objectId(product)
              }
            },
            {
              '$lookup': {
                'from': 'product',
                'localField': 'products.item',
                'foreignField': '_id',
                'as': 'cartpdts'
              }
            }, {
              '$project': {
                '_id': 1,
                'quantity': 1,
                'item': 1,
                'products': 1,
                'product': {
                  '$arrayElemAt': [
                    '$cartpdts', 0
                  ]
                }
              }
            }, {
              '$project': {
                '_id': 1,
                'quantity': '$products.quantity',
                'price': '$product.offerprice'
              }
            }, {
              '$project': {
                'subtotal': {
                  '$multiply': [
                    { $toInt: "$quantity" },
                    { $toInt: "$price" },
                  ]
                }
              }
            }
          ]

        ).toArray();
      // console.log(subtotal);
      resolve(subtotal[0]?.subtotal);
    });
  },
  //----------------GETTING ORDER ADDRESS--------------------------
  getOrderAddress: function (userId, addressId) {
    // console.log('aaaaaaaaa', addressId)
    // console.log(userId);
    return new Promise(async (resolve, reject) => {
      let address = await db.get().collection(collection.USER_COLLECTION).aggregate(
        [
          {
            '$match': {
              '_id': objectId(userId)
            }
          }, {
            '$unwind': {
              'path': '$address'
            }
          }, {
            '$match': {
              'address._id': objectId(addressId)
            }
          }, {
            '$project': {
              'address': 1
            }
          }
        ]
      ).toArray()


      // console.log(address);
      resolve(address)
    })
  },

  //PLACE ORDER
  placeOrder: (paymentMethod, userId, products, total, address, wallet, coupon) => {

    return new Promise(async (resolve, reject) => {
      let status = paymentMethod === 'COD' ? 'placed' : 'pending'
      // let status = 'pending'
      products.forEach(element => {
        element.status = status
      });
      let orderObj = {
        deliveryDetails: {
          fullname: address[0]?.address.firstname + " " + address[0]?.address.lastname,
          email: address[0]?.address.email,
          address: address[0]?.address.address,
          mobile: address[0]?.address.mobile,
          country: address[0]?.address.country,
          state: address[0]?.address.state,
          district: address[0]?.address.district,
          city: address[0]?.address.city,
          pincode: address[0]?.address.pincode
        },
        userId: objectId(userId),
        paymentMethod: paymentMethod,
        products: products,
        totalAmount: parseInt(total),
        status: status,
        displayDate: new Date().toDateString(),
        date: new Date(),
        return: false,
        coupon: coupon
      }

      db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
        db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(userId) })

        products.forEach(element => {
          db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(element.item) }, { $inc: { stock: -(element.quantity) } })
        })
        resolve(response.insertedId)

      })
    })
  },

  walletPurchase: (userId, wallet, total) => {
    return new Promise(async (resolve, reject) => {
      if (wallet.walletBalance >= total) {
        const obj4 = {
          orderId: new objectId(),
          date: new Date().toDateString(),
          mode: "Debit",
          type: "Purchase",
          amount: total
        }
        await db.get().collection(collection.WALLET_COLLECTION).updateOne(
          { userId: objectId(userId) }, { $inc: { walletBalance: -(total) }, $push: { transaction: obj4 } })
          .then((response) => {
            resolve(response)
          })
      } else {
        reject("No enough amount")
      }
    })
  },

  //VERIFY PAYMENT
  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require('crypto');
      var hmac = crypto.createHmac('sha256',"0tmFuv9WVV3mUIi6nRlhVVkk")
      hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
      hmac = hmac.digest('hex')

      if (hmac == details['payment[razorpay_signature]']) {
        resolve()
      } else {
        reject()
      }
    })
  },

  //PAYMENT STATUS CHANGING
  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne(
        {
          _id: objectId(orderId)
        },
        {
          $set: { status: 'placed'}
        }
      ).then(() => {
        resolve()
      })
    })
  },

  //GET CART PRODUCTS
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db.get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) })
      resolve(cart.products);
    });
  },

  //GET USER ORDERS
  // getUserOrders: (orderId) => {
  //   console.log(orderId);
  //   return new Promise(async (resolve, reject) => {
  //     let orderItems = await db
  //       .get()
  //       .collection(collection.ORDER_COLLECTION)
  //       .aggregate([
  //         {
  //           $match: { userId: objectId(orderId) },
  //         },
  //         {
  //           $unwind: "$products",
  //         },
  //         {
  //           $project: {
  //             item: "$products.item",
  //             quantity: "$products.quantity",
  //             deliveryDetails: "$deliveryDetails",
  //             paymentMethod: "$paymentMethod",
  //             totalAmount: "$totalAmount",
  //             status: "$status",
  //             date: "$date",
  //           },
  //         },
  //         {
  //           $lookup: {
  //             from: collection.PRODUCT_COLLECTION,
  //             localField: "item",
  //             foreignField: "_id",
  //             as: "product",
  //           },
  //         },
  //         {
  //           $project: {
  //             item: 1,
  //             quantity: 1,
  //             product: { $arrayElemAt: ["$product", 0] },
  //             deliveryDetails: 1,
  //             paymentMethod: 1,
  //             totalAmount: 1,
  //             status: 1,
  //             date: 1,
  //           },
  //         },
  //         {
  //           $sort: { date: -1 },
  //         },
  //       ])
  //       .toArray();
  //     resolve(orderItems);
  //   });
  // },


  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) }).sort({ date: -1 }).toArray()
      resolve(orders)
    })
  },
  // .aggregate([
  //   {
  //     $match: { userId: objectId(userId) }
  //   },
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
  //       status: '$products.status',
  //       displayDate: '$displayDate',
  //       date: '$date'
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
  //       offerprice: '$product.offerprice',
  //       status: 1,
  //       displayDate: 1,
  //       totalAmount: '$totalAmount',
  //       date: 1

  //     }
  //   },
  //   {
  //     $sort: { date: -1 },
  //   },
  // ])



  //GET SINGLE ORDER DETAILS 
  getOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.ORDER_COLLECTION).findOne(
        { _id: objectId(orderId) }
      ).then((response) => {
        resolve(response)
      })
    })
  },

  getOrderPdts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let order = await db.get().collection(collection.ORDER_COLLECTION).find({ _id: objectId(orderId) })
        // .aggregate([
        //   {
        //     '$match': {
        //       '_id': objectId(orderId)
        //     }
        //   },
        //   {
        //     '$lookup': {
        //       'from': 'product',
        //       'localField': 'products.item',
        //       'foreignField': '_id',
        //       'as': 'orderpdts'
        //     }
        //   },
        //   {
        //     $project: {
        //       orderpdts: { $arrayElemAt: ["$orderpdts", 0] },
        //       quantity: { $arrayElemAt: ["$products", 0] }
        //     }

        //   }
        // ])
        .toArray()
      resolve(order)
    })
  },

  //CANCEL ORDER
  cancelOrder: (orderId, prodId, userId) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId), "products.item": ObjectId(prodId) },
          { $set: { "products.$.status": "cancelled" } }
        )
      let order = await db.get().collection(collection.ORDER_COLLECTION).find({ _id: objectId(orderId) }).toArray()

      if (order[0].status !== 'pending') {
        if (order[0].paymentMethod === 'razorpay' || order[0].paymentMethod === 'wallet') {
          const obj = {
            orderId: new ObjectId(),
            date: new Date().toDateString(),
            reference: order[0]._id,
            mode: "Credit",
            type: "Refund",
            amount: order[0].totalAmount,
          }
          await db.get().collection(collection.WALLET_COLLECTION).updateOne(
            { userId: objectId(userId) }, { $inc: { walletBalance: order[0].totalAmount }, $push: { transaction: obj } }
          )
          resolve("Success");
        }
      }
    }
    )
  },

  cancelOrders: (orderId) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          { $set: { status: "cancelled" } }
        )
      let order = await db.get().collection(collection.ORDER_COLLECTION).find({ _id: objectId(orderId) }).toArray()
      if (order[0].status !== 'pending') {
        if (order[0].paymentMethod === 'razorpay' || order[0].paymentMethod === 'wallet') {
          const obj = {
            orderId: new ObjectId(),
            date: new Date().toDateString(),
            reference: order[0]._id,
            mode: "Credit",
            type: "Refund",
            amount: order[0].totalAmount,
          }
          await db.get().collection(collection.WALLET_COLLECTION).updateOne(
            { userId: objectId(userId) }, { $inc: { walletBalance: order[0].totalAmount }, $push: { transaction: obj } }
          )
          resolve("Success");
        }
      }
    }
    )
  },

  // WISHLIST ORDER
  getWishlistProducts: (userId) => {
    console.log(userId);
    return new Promise(async (resolve, reject) => {
      let wishlistItems = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(wishlistItems);
    });
  },


  wishlistItems: (userId) => {
    return new Promise((resolve, reject) => {
      const wishlist = db.get().collection(collection.WISHLIST_COLLECTION).find({ user: ObjectId(userId) }).toArray();
      resolve(wishlist)
    })
  },

  // ADD WISHLIST ITEMS
  addToWishlist: (prodId, userId) => {
    return new Promise(async (resolve, reject) => {
      let userWishlist = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ user: objectId(userId) });
      let prodObj = {
        item: objectId(prodId),
      }; ``
      if (userWishlist) {
        let prodExists = userWishlist.products.findIndex(
          (product) => product.item == prodId
        );
        console.log(prodExists);
        if (prodExists == -1) {
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              { $push: { products: { item: objectId(prodId) } } }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $pull: { products: { item: objectId(prodId) } },
              }
            )
            .then((response) => {
              reject();
            });
        }
      } else {
        let wishlistObject = {
          user: objectId(userId),
          products: [prodObj],
        };
        db.get()
          .collection(collection.WISHLIST_COLLECTION)
          .insertOne(wishlistObject)
          .then((response) => {
            resolve();
          });
      }
    });
  },

  //DELETE PRODUCT FROM CART
  deleteWishProduct: (prodId, userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.WISHLIST_COLLECTION)
        .updateOne(
          {
            user: objectId(userId),
          },
          {
            $pull: { products: { item: objectId(prodId) } },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  //RAZOR PAY GENERATE FUNCTION
  generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: total * 100,
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          console.log("New Order:", order);
          resolve(order);
        }
      })
    })
  },

  //USER EDIT
  userEdit: (userId, newdata) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.USER_COLLECTION).updateOne(
        {
          _id: objectId(userId)
        },
        {
          $set: {
            fname: newdata.fname,
            lname: newdata.lname,
            email: newdata.email,
            phonenumber: newdata.phonenumber
          }
        }
      ).then(() => {
        resolve()
      })
    })
  },


  //ADD NEW ADDRESS
  addAddress: (userId, data) => {
    return new Promise(async (resolve, reject) => {
      data._id = new ObjectId()
      await db.get().collection(collection.USER_COLLECTION).updateOne(
        {
          _id: objectId(userId)
        },
        {
          $push: {
            address: data
          }
        }
      ).then((response) => {
        console.log(response, 'hhhhhhhhhhhhhhhhhh');
        resolve(response)
      })
    })
  },

  //GET ADDRESSES
  getAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
      let address = await db.get().collection(collection.USER_COLLECTION).aggregate([
        {
          $match:
          {
            _id: objectId(userId)
          }
        },
        {
          $unwind: {
            path: '$address'
          }
        },
        {
          $project: {
            address: 1
          }
        }
      ]).toArray()
      resolve(address)
    })
  },

  //------------------DELETE ADDRESS------------------------
  deleteAddress: (addressId, userId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).updateOne(
        {
          _id: objectId(userId)
        },
        {
          $pull: {
            address: { _id: objectId(addressId) }
          }
        }
      ).then((response) => {
        resolve(response)
      })
    })
  },

  //CHANGE PASSWORD
  changePassword: (userId, data) => {
    // console.log('hdsjkdsaljlksadl',userId);
    // console.log(data);
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collection.USER_COLLECTION).findOne(
        { _id: objectId(userId) }
      )
      if (user) {
        bcrypt.compare(data.password, user.password).then(async (status) => {
          if (status) {
            // console.log('Hiiiiiiiiiiiiiiiiiii');
            data.newPassword = await bcrypt.hash(data.newPassword, 10)
            db.get().collection(collection.USER_COLLECTION).updateOne(
              {
                _id: objectId(userId)
              },
              {
                $set: {
                  password: data.newPassword
                }
              }
            ).then((response) => {
              resolve(response)
            })
          }
        }).catch((response) => {
          reject()
        })
      }
    })
  },

  //-----------------------REDEEM COUPON--------------------
  redeemCoupon: (couponDetails) => {
    let coupon = couponDetails.coupon.toUpperCase()
    return new Promise(async (resolve, reject) => {
      let currentDate = new Date()
      let couponCheck = await db.get().collection(collection.COUPON_COLLECTION).findOne(
        { $and: [{ coupon: coupon }, { expDate: { $gte: currentDate } }] }
      )
      if (couponCheck !== null) {
        resolve(couponCheck)
      } else {
        reject()
      }
    })
  },

  //---------------------WALLET-----------------------------------
  wallet: (userId) => {
    return new Promise(async (resolve, reject) => {
      let wallet = await db.get().collection(collection.WALLET_COLLECTION).aggregate([
        {
          $match: {
            userId: objectId(userId)
          }
        },
        {
          $unwind: {
            path: "$transaction"
          }
        },
        {
          $project: { "transaction": 1 }
        },
        {
          $sort: { "transaction.date": -1 }
        }
      ]).toArray()
      resolve(wallet)

    })
  },
  walletAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(userId);
      let walletamt = await db.get().collection(collection.WALLET_COLLECTION).findOne({ userId: objectId(userId) })
      if (walletamt) {
        resolve(walletamt)
      }
    })
  },


  //--------------------------RETURN PRODUCT----------------------------------------
  returnProduct: (orderId, prodId, userId, product) => {
    let dateStatus = new Date()
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId), "products.item": objectId(prodId) }, { $set: { 'products.$.status': 'returned', 'products.$.statusUpdateDate': dateStatus } }
      )
      resolve(response)
      const obj3 = {
        orderId: new ObjectId(),
        date: new Date().toDateString(),
        mode: "Credit",
        type: "Return",
        amount: product.offerprice,
      }
      await db.get().collection(collection.WALLET_COLLECTION).updateOne(
        { userId: objectId(userId) }, { $inc: { walletBalance: product.offerprice }, $push: { transaction: obj3 } }
      )
    })

  },


  returnProducts: (orderId, prodId, userId, product) => {
    let dateStatus = new Date()
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId), "products.item": objectId(prodId) }, { $set: { status: 'returned', statusUpdateDate: dateStatus } }
      )
      resolve(response)
      const obj3 = {
        orderId: new ObjectId(),
        date: new Date().toDateString(),
        mode: "Credit",
        type: "Return",
        amount: totalAmount,
      }
      await db.get().collection(collection.WALLET_COLLECTION).updateOne(
        { userId: objectId(userId) }, { $inc: { walletBalance: totalAmount }, $push: { transaction: obj3 } }
      )
    })

  },
};
