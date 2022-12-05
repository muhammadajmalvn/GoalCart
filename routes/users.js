const express = require("express");
const router = express.Router();
const signin = require('../controllers/user/signin')
const homepage = require('../controllers/user/homepage')
const products = require('../controllers/user/products')
const productdetails = require('../controllers/user/singleproduct')
const wishlist = require('../controllers/user/wishlist')
const cart = require('../controllers/user/cart')
const wallet = require('../controllers/user/wallet')
const placeOrder = require('../controllers/user/place-order')
const orders = require('../controllers/user/orders')
const address = require('../controllers/user/address')
const password = require('../controllers/user/passwords')
const profile = require('../controllers/user/profile')
const checkout = require('../controllers/user/checkout')

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/');
  }
}

const verifyLogout = (req, res, next) => {
  if (req.session.loggedIn) {
    res.redirect('/home');
  } else {
    next()
  }
}

//----------------------HOMEPAGE-----------------------------------------
router.get("/",
verifyLogout,
 signin.landingPage);


//---------------------------USER SIGNUP----------------------------------
router.get("/signup", signin.userSignup);
router.post("/signup", signin.signupPost);


//user login page
router.get("/login",
verifyLogout,
signin.userLogin);
router.post("/login",signin.userLoginPost);


//----------------------------LOGIN WITH OTP-------------------------------
router.get('/otplogin',
verifyLogout,
 signin.otpLoginpage)
router.post('/otplogin', signin.otpLogin)

//------------------------------OTP VERIFICATION----------------------------
router.get("/otp-verification", signin.otpVerificationPage);
router.post("/otp-verification", signin.otpVerification),

  //---------------------USER LOG OUT---------------------------------------
router.get("/logout",
verifyLogin,
 signin.userLogout);


router.get("/home",
verifyLogin,
 homepage.homepage);


//-------------------------DISPLAY PRODUCTS----------------------------------
router.get("/products", products.productsview)
router.get('/productsearch/', products.productsearch)


//-------------------------------PRODUCT DETAILS-----------------------------
router.get("/product-details/:id", productdetails.productdetails);


//------------------------WISHLIST VIEW--------------------------------------
router.get("/wishlist",
verifyLogin,
wishlist.wishlistview);

//-----------------------ADD TO WISHLIST-------------------------------------
router.get("/add-to-wishlist/:proId", 
verifyLogin,
wishlist.addtoWishlist);

//--------------------DELETE FROM WISHLIST-----------------------------------
router.get("/delete-wish-product/:id",
verifyLogin,
 wishlist.deleteWishlist);

//------------------------ VIEW CART-----------------------------------------
router.get("/cart",
verifyLogin,
cart.viewCart);

//---------------------------ADD TO CART-------------------------------------
router.get("/add-to-cart/:id", 
verifyLogin,
cart.addtoCart);

//--------------------CHANGE PRODUCT QUANTITY-------------------------------
router.post("/change-product-quantity", cart.changeQuantity);

//-------------------------DELETE FROM CART---------------------------------
router.get("/delete-cart-product/:id", cart.deleteCartProduct);

//----------------------WALLET DISPLAY--------------------------------------
router.get('/wallet',
verifyLogin,
 wallet.walletView)

//--------------------------PLACE ORDER-------------------------------------
router.get("/place-orders", 
verifyLogin,
placeOrder.placeOrder);

router.post("/place-orders", 
verifyLogin,
placeOrder.placeOrderPost);

//-------------------------VERIFY PAYMENT----------------------------------

router.post('/verify-payment',
verifyLogin,
 placeOrder.verifyPayment)

//----------------------ORDER HISTORY PAGE-----------------------
router.get("/orders", 
verifyLogin,
orders.getOrders);

//------------------------CANCEL ORDER----------------------------
router.put("/cancel-order", 
verifyLogin,
orders.cancelOrder);
router.put("/cancel-orders",
verifyLogin,
 orders.cancelOrders);

//---------------------INVOICE DOWNLOAD AND VIEW-------------------------
router.get('/invoice/:id',
verifyLogin,
 orders.invoiceView)

//---------------------RETURN PRODUCT-------------------------------------
router.post('/return-product',
verifyLogin,
 orders.returnProduct)
router.post('/return-products',
verifyLogin,
 orders.returnProducts)

//-----------------PROFILE-----------------------------------------------
router.get('/profile',
verifyLogin,
 profile.viewProfile)

//---------------------USER DETAILS EDIT--------------------------------
router.post('/profile',
verifyLogin,
 profile.editProfile)

//---------------------ADDRESS ADDING---------------------------
router.post('/add-address',
verifyLogin,
 address.addAddress)

//----------------------ADDRESS--------------------------------- 
router.get('/address',
verifyLogin,
 address.viewAddresses)

//-----------------------DELETE ADDRESS---------------------------
router.get('/delete-address/:id',
verifyLogin,
 address.deleteAddress)

//------------------------PASSWORD--------------------------------
router.get('/passwords',
verifyLogin,
 password.viewPassword)

//------------------------PASSWORD CHANGE------------------------
router.post('/passwords', password.changePassword)

//-----------------------ADDRESS CHECKOUT-------------------------
router.post('/add-address-checkout', placeOrder.addAddressCheckout)

//----------------------COUPON REDEEM-----------------------------
router.post('/redeem-coupon',
verifyLogin,
 checkout.redeemCoupn)


module.exports = router;
