const db = require("../config/connection");
const collection = require("../config/collection");
const objectId = require("mongodb").ObjectId;
require('dotenv').config()

module.exports = {
  //-----------------------Add products-----------------------
  // USING MULTER AND CLOUDINARY
  addProduct: (product, urls, callback) => {
    return new Promise(async (resolve, reject) => {
      product.date = new Date()
      product.actualprice = parseInt(product.actualPrice)
      product.offerprice = parseInt(product.actualPrice)
      let checkOffer = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: product.category })

      if (checkOffer.categoryOfferPer > 0) {
        let discount = product.actualPrice * checkOffer.categoryOfferPer / 100
        product.offerprice = parseInt(product.actualPrice - discount)
      }
      product.stock = parseInt(product.stock)
      product.description = product.description
      product.image = urls
      await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
        callback(data.insertedId.toString())
      })
    })
  },


  //Get all products in admin side
  getAllProducts: (pageNo) => {
    // console.log(pageNo, 'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
    // const index = (pageNo > 0) ? (pageNo) : 0;
    // console.log(index, 'aaaaaaaaaaaaaabbbbbbbbbbbbb')
    return new Promise(async (resolve, reject) => {
      let products
      const limit = 5
      products = await db.get().collection(collection.PRODUCT_COLLECTION).find().skip(pageNo * limit).limit(limit).toArray()
      resolve([products, limit]);
    });
  },

  //get products in user side
  getProducts: () => {
    return new Promise(async (resolve, reject) => {
      let Products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(Products);
    });
  },


  //Edit a product
  editProduct: (prodId, productDetails, urls, img) => {
    return new Promise(async (resolve, reject) => {

      let pro = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(prodId) })
      let image1 = pro.image[0]
      let image2 = pro.image[1]
      let image3 = pro.image[2]
      let image4 = pro.image[3]
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



      if (img.img4) {
        uploadImg[3] = urls[0]
        if (urls == null) {

        } else {
          urls.shift()
        }
      } else {
        uploadImg[3] = image4
      }
      productDetails.stock = parseInt(productDetails.stock)
      productDetails.actualPrice = parseInt(productDetails.actualPrice)
      productDetails.offerprice = parseInt(productDetails.actualprice)
      let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: productDetails.category })
      let prod = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ product: productDetails.product })
      if (prod.prodOfferPer || category.categoryOfferPer) {
        if (prod.prodOfferPer > category.categoryOfferPer) {
          offerPer = prod.prodOfferPer
          discount = productDetails.actualPrice * offerPer / 100
        } else {
          offerPer = category.categoryOfferPer
          discount = productDetails.actualPrice * offerPer / 100
        }
        productDetails.offerprice = productDetails.actualPrice - discount
        productDetails.offerprice = parseInt(Math.ceil(productDetails.offerprice))
      }
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: objectId(prodId) },
          {
            $set: {
              product: productDetails.product,
              brand: productDetails.brand,
              stock: productDetails.stock,
              actualprice: productDetails.actualPrice,
              offerprice: productDetails.offerprice,
              category: productDetails.category,
              description: productDetails.description,
              image: uploadImg
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },




  //Get product details
  getProductDetails: (prodId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(prodId) })
        .then((product) => {
          resolve(product);
        });
    });
  },
  //Delete a product
  deleteProduct: (prodId) => {
    // console.log(prodId);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: objectId(prodId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  //--------------------STOCK TAKING------------------------
  getStockCount: (prodId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(prodId) }).then((response) => {
        // console.log("ggggggggggggggggggggggg",response.stock);
        resolve(response.stock)
      })
    });
  },
  //--------------------CATEGORY OFFER-------------------------
  categoryOffer: (discount, category) => {
    // console.log(category);
    return new Promise(async (resolve, reject) => {
      let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: category }).toArray();
      console.log(products);

      for (i = 0; i < products.length; i++) {

        let offer = Math.ceil((products[i].actualprice) * discount / 100)

        let CategoryOfferPrice = Math.ceil(products[i].actualprice - offer);

        db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ category: category },
          { $set: { categoryOfferPer: discount } })

        db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ product: products[i].product }, { $set: { categoryOfferPer: discount, Categorydiscount: offer, CategoryOfferPrice: CategoryOfferPrice }, })
          .then(() => {
            resolve()
          })
      }
    })
  },

  //----------------PRODCUT OFFER----------------------
  productOffer: (discount, product) => {
    return new Promise(async (resolve, reject) => {
      let prod = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ product: product })
      console.log(prod);
      let prodOffer = Math.ceil((prod.actualprice) * discount / 100)

      let productOfferPrice = Math.ceil(prod.actualprice - prodOffer);

      db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
        { product: product }, { $set: { prodOfferPer: discount, prodDiscount: prodOffer, productOfferPrice: productOfferPrice } }
      ).then(() => {
        resolve()
      })

    })
  },

  //-----------OFFER CALCULATION-------------------------------
  offerPriceCalc: (product) => {
    return new Promise(async (resolve, reject) => {
      let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ product: product }).toArray();
      console.log(products);

      for (i = 0; i < products.length; i++) {
        if (products[i].CategoryOfferPrice > products[i].productOfferPrice) {
          var offerprice = products[i].productOfferPrice
          var currentOffer = products[i].productOfferPer
        } else {
          var offerprice = products[i].CategoryOfferPrice
          var currentOffer = products[i].categoryOfferPer
        }
        console.log(offerprice);
        db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ product: products[i].product }, { $set: { offerprice: offerprice, currentOffer: currentOffer } })
          .then(() => {
            resolve()
          })
      }
    })
  },

  offerPriceCalctn: (category) => {
    return new Promise(async (resolve, reject) => {
      let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: category }).toArray();
      console.log(products);
      for (i = 0; i < products.length; i++) {
        if (products[i].CategoryOfferPrice > products[i].productOfferPrice) {
          var offerprice = products[i].productOfferPrice
          var currentOffer = products[i].productOfferPer

        } else {
          var offerprice = products[i].CategoryOfferPrice
          var currentOffer = products[i].categoryOfferPer

        }
        console.log(offerprice);
        db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ product: products[i].product }, { $set: { offerprice: offerprice, currentOffer: currentOffer }, })
          .then(() => {
            resolve()
          })
      }
    })
  },


  getProductImage: (proId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((response) => {
        resolve(response)
      })
    })
  }
}
