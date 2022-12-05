const userHelpers = require("../../helpers/user-helpers");

  exports.redeemCoupn= async (req, res) => {
    const userId = req.session.user._id
    let totalPrice = await userHelpers.getTotalAmount(userId)
    console.log(req.body);
    let coupon =  req.body.coupon
    // let couponDiscount = req.body.coupon
    await userHelpers.redeemCoupon(req.body)
      .then((Data) => {
        // console.log('aaaaaaa', Data);
  
        if (totalPrice >= Data.minPrice) {
          let less = (totalPrice * Data.couponOffer) / 100
          if (less > Data.maxOffer) {
            less = Data.maxOffer
          }
          totalPrice = totalPrice - less
          res.json({ total: totalPrice, offer: less ,coupon: coupon})
        }
  
        else if (totalPrice < Data.minPrice) {
          const minMsg = "This coupon is valid only for purchase above ₹ " + Data.minPrice
          res.json({ msg: minMsg, total: totalPrice })
        }
  
      }).catch(() => {
        const msg = "Invalid Coupon Or It's already Expired"
        res.json({ msg: msg, total: totalPrice })
      })
  }