const express = require("express");
const router = express.Router();
const adminSignin = require('../controllers/admin/adminSignin')
const products = require('../controllers/admin/products')
const users = require('../controllers/admin/users')
const category = require('../controllers/admin/category')
const orders = require('../controllers/admin/orders')
const offers = require('../controllers/admin/offers')
const coupon = require('../controllers/admin/coupons')
const reports = require('../controllers/admin/reports')
const multer = require('multer')
const path = require("path");


const verifyLogin = (req, res, next) => {
    if (req.session.loggedIn) {
      next()
    } else {
      res.redirect('/admin');
    }
  }
  
  const verifyLogout = (req, res, next) => {
    if (req.session.loggedIn) {
      res.redirect('/admin/dashboard');
    } else {
      next()
    }
  }

upload = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname)
        if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== ".webp") {
            cb(new Error("File type is not supported"), false)
            console.log('Its working perfcttttttttttttttttttttttttttt');
            return
        }
        cb(null, true)
    }
})


/* GET home page. */
router.get("/",
verifyLogout,
adminSignin.adminLogin);


// admin login check and redirect to landing page
router.post("/login", adminSignin.adminLoginpost);

//-------------------LOGOUT-------------------------------
router.get("/logout",
verifyLogin,
adminSignin.adminLogout);


//Dashboard page
router.get("/dashboard",
verifyLogin,
reports.dashboard);


//Product page
router.get("/products",
verifyLogin,
products.productsView);

//ADD PRODUCTS
router.get("/add-product",
verifyLogin,
 products.addProduct);
router.post('/add-product', upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
]),
    products.postAddProduct)

//EDIT PRODUCT 
router.get("/edit-products/:id",
verifyLogin,
 products.editProduct);
router.post('/edit-products/:id',
    // upload.array("images", 4),
    upload.fields([
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
        { name: 'image4', maxCount: 1 },
    ]),
    products.postEditProduct)

//--------------------DELETING PRODUCTS-------------------
router.get("/delete-product/:id",
verifyLogin,
products.deleteProduct);

//---------------------USERS PAGE---------------------------
router.get("/users",
verifyLogin,
 users.usersView);

//----------------CHANGING USER STATUS----------------------
router.get("/users/:id",users.changeUserStatus);

//---------------------CATEGORY-----------------------------
router.get("/category",
verifyLogin,
category.categoryView);

//--------------CATEGORY MANAGEMENT-----------------------
router.post("/category", category.categoryAdd);

//------------------DELETE CATEGORY--------------------------
router.get("/category/delete-category/:id", category.categoryDelete);

//-------------------ORDERS----------------------------------
router.get("/orders",
verifyLogin,
 orders.getOrders)

//------------------ORDER STATUS CHANGE-----------------------
router.get('/orders/:status', orders.orderStatus)
router.post('/order-status', orders.changeOrderStatus)
router.post('/offer-order-status', orders.changeStatus)

//-------------------DASHBOARD REPORT-------------------------
router.get('/dashboard/:days',
verifyLogin,
 reports.dashboardDaywise)

//--------------------SALES REPORT-----------------------------
router.get('/sales-report',
verifyLogin,
 reports.salesReport)

//--------------------CATEGORY OFFER-------------------------
router.get('/categoryOffers',
verifyLogin,
 offers.getCategoryOffer)
router.post('/categoryOffer', offers.categoryOffer)

//----------------PRODUCT OFFER-----------------------
router.get('/productOffers',
verifyLogin,
 offers.getProductOffer)
router.post('/productOffers', offers.productOffer)

//---------------COUPON MANAGEMENT-------------------
router.get('/coupons',
verifyLogin,
 coupon.getCoupons)

//------------------ADD COUPON-------------------------
router.post('/add-coupon',
verifyLogin,
 coupon.addCoupon)

//--------------------DELETE COUPON----------------------
router.post('/delete-coupon', coupon.deleteCoupon)

//---------------BANNER MANAGEMENT--------------------
router.get('/banner',
verifyLogin,
 reports.banner)
router.post('/banner', upload.fields([
    { name: 'banner1', maxCount: 1 },
    { name: 'banner2', maxCount: 1 },
    { name: 'banner3', maxCount: 1 },
]),
    reports.addBanner)
router.get('/edit-banner',reports.editBanner)
router.post('/edit-banner',
    // upload.array("images", 4),
    upload.fields([
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
    ]),
    reports.postEditBanner)
module.exports = router;





