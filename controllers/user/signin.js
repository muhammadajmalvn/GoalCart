const userHelpers = require("../../helpers/user-helpers");
const productHelpers = require("../../helpers/product-helpers");
const adminHelpers = require("../../helpers/admin-helpers")
require('dotenv').config()
const client = require("twilio")(process.env.ACCOUNT_SID,process.env. AUTH_TOKEN);


//--------------------------USER SIGN UP----------------------------
exports.userSignup = function (req, res, next) {
  res.render("user/signup");
}

exports.signupPost = (req, res) => {
  userHelpers
    .userSignup(req.body)
    .then((response) => {
      // console.log(response);
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
      res.render("user/signup", { err })
    });
}


//-----------------------------USER LOGIN POST_---------------------------------------


exports.userLogin = function (req, res, next) {
  res.render("./user/login");
}


exports.userLoginPost = (req, res) => {
  userHelpers
    .userSignin(req.body)
    .then((response) => {
      console.log(response);
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect("/home");
    })
    .catch((data) => {
      console.log(data);
      var string = encodeURIComponent("Check mail id or password");
      res.redirect("/login?valid=" + string);
    });
}

//----------------------------OTP LOGIN----------------------------------------------------
exports.otpLoginpage = (req, res) => {
  res.render("user/otp-login")
}

exports.otpLogin = (req, res) => {
  console.log(req.body.mobile);
  userHelpers
    .otpLogin(req.body.mobile)
    .then((response) => {
      let phone = response.user.phonenumber;
      client.verify
        .services(process.env.SERVICE_ID)
        .verifications.create({
          to: `+91${phone}`,
          channel: "sms",
        })
        .then((data) => {
          req.session.user = response.user;
          res.render("user/otp-verification", { phone, not: true });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((response) => {
      req.session.loginErr = "Incorrect Phone Number";
      res.redirect("/login");
    });
}

exports.otpVerificationPage = (req, res) => {
  res.render("user/otp-verification", { not: true });
}

exports.otpVerification = (req, res) => {
  console.log(req.body.mobile);
  client.verify
    .services(otp.serviceID)
    .verificationChecks.create({
      to: `+91${req.body.mobile}`,
      code: req.body.otp,
    })
    .then((data) => {
      console.log(data);
      if (data.valid) {
        req.session.loggedIn = true;
        res.redirect("/home");
      } else {
        delete req.session.user;
        req.session.otpErr = "Enter valid OTP";
        res.redirect("/login");
      }
    })
    .catch((err) => {
      delete req.session.user;
      res.redirect("/login");
    });
}


//---------------------USER LOG OUT------------------------------------
exports.userLogout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
}

//---------------------------LANDING PAGE-----------------------
exports.landingPage = async function (req, res, next) {
  let banner = await adminHelpers.getBanner()
  let Products = await productHelpers.getProducts()
  res.render("./user/landing", { nouser: "true", banner, Products: Products });
}