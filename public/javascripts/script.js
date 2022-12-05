function signupValidate() {
  const firstname = document.getElementById("fname");
  const lastname = document.getElementById("lname");
  const email = document.getElementById("email");
  const phnumber = document.getElementById("phonenumber");
  const pass1 = document.getElementById("password-1");
  const pass2 = document.getElementById("password-2");
  const error = document.getElementsByClassName("invalid-display");
  require('dotenv').config()

  // First name and last name validation

  //   if (
  //     firstname.value.trim() === "" ||
  //     firstname.value.trim().match(/^[0-9]+$/)
  //   ) {
  //     error[0].style.display = "block";
  //     error[0].innerHTML = "Enter valid firstname";
  //     firstname.style.border = "1px solid red";
  //     return false;
  //   } else {
  //     error[0].innerHTML = " ";
  //     firstname.style.border = "1px solid green";
  //   }

  //   if (
  //     lastname.value.trim() === "" ||
  //     lastname.value.trim().match(/^[0-9]+$/)
  //   ) {
  //     error[1].style.display = "block";
  //     error[1].innerHTML = "Enter valid firstname";
  //     lastname.style.border = "1px solid red";
  //     return false;
  //   } else {
  //     error[1].innerHTML = " ";
  //     lastname.style.border = "1px solid green";
  //   }

  // email validation
  if (
    !email.value
      .trim()
      .match(
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
      )
  ) {
    error[0].style.display = "block";
    error[0].innerHTML = "Enter valid email address";
    email.style.border = "2px solid red";
    return false;
  } else {
    error[0].innerHTML = "";
    email.style.border = "2px solid green";
  }

  //mobile number validation
  if (phnumber.value.trim() == "" || phnumber.value.length < 9) {
    error[1].style.display = "block";
    error[1].innerHTML = "Enter valid phone number ";
    phnumber.style.border = "2px solid red";
    return false;
  } else {
    error[1].innerHTML = "";
    error[1].style.border = "2px solid green";
  }

  //password validation
  if (pass1.value.trim() === "" || pass1.value.length < 8) {
    error[2].style.display = "block";
    error[2].innerHTML = "password must be 8 character";
    pass1.style.border = "2px solid red";
    return false;
  } else {
    error[2].innerHTML = "";
    pass1.style.border = "2px solid green";
  }

  if (pass1.value === pass2.value) {
    error[3].style.display = "block";
    error[3].innerHTML = "";
    pass2.style.border = "2px solid green";
    return false;
  } else {
    error[3].style.display = "block";
    error[3].innerHTML = "Passwords do not match";
    pass2.style.border = "2px solid red";
  }
  return true;
}
function otpValidation() {
  let otp = document.getElementById("otp");
  let err = document.getElementsByClassName("error");

  if (otp.value.trim() === "" || otp.value.length === 5) {
    err.style.display = "block";
    err.innerHTML = "Enter OTP";
    return false;
  } else {
    err.innerHTML = "";
  }
  return true;
}

var options = {
  width: 300,
  zoomWidth: 900,
  offset: { vertical: 60, horizontal: 20 },
  scale: 0.5,
};
new ImageZoom(document.getElementById("#img-container"), options);
let i = 0;
// $(document).ready(function () {
//   $(".block__pic").imagezoomsl({
//     zoomrange: [3, 3],
//   });
// });

//----------------------ADD TO CART-------------------------------
function addtocart(prodId) {
  $.ajax({
    url: "/add-to-cart/" + prodId,
    method: "get",
    success: (response) => {
      if (response.status) {
        let count = $("#cart-count").html();
        count = parseInt(count) + 1;
        $("#cart-count").html(count);
        //popup
        document.getElementById("success").classList.remove("d-none");
        setTimeout(function () {
          document.getElementById("success").classList.add("d-none");
        }, 1000);
      } else {
        location.href = "/login";
      }
    },
  });
}

//--------------------CANCEL ORDER---------------------------
function cancelOrder(orderId, proId) {
  console.log(orderId, proId),
    swal(
      {
        title: "Are you sure?",
        text: "Do you want to cancel the order",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, Cancel my order",
        cancelButtonText: "No, cancel please!",
        closeOnConfirm: true,
        closeOnCancel: true,
      },
      function (isConfirm) {
        if (isConfirm) {
          $.ajax({
            url: "/cancel-order",
            method: "put",
            data: { orderId, proId },
            success: (response) => {
              if (response.status) {
                location.reload();
              }
            },
          });
        }
      }
    );
}



function cancelOrders(orderId) {
  console.log(orderId)
  swal(
    {
      title: "Are you sure?",
      text: "Do you want to cancel the order",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, Cancel my order",
      cancelButtonText: "No, cancel please!",
      closeOnConfirm: true,
      closeOnCancel: true,
    },
    function (isConfirm) {
      if (isConfirm) {
        $.ajax({
          url: "/cancel-orders",
          method: "put",
          data: { orderId},
          success: (response) => {
            if (response.status) {
              location.reload();
            }
          },
        });
      }
    }
  );
}
//--------------------ADMIN ORDER STATUS--------------------------
function statusChange(proId, orderId) {
  var status = document.getElementById(proId + orderId).value;
  swal(
    {
      title: "Are you sure?",
      text: "Do you want to " + status + " the order",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, " + status + " it!",
      cancelButtonText: "No!",
      closeOnConfirm: true,
      closeOnCancel: true,
    },
    function (isConfirm) {
      if (isConfirm) {
        $.ajax({
          url: "/admin/order-status",
          data: {
            orderId,
            status,
            proId
          },
          method: "post",
          success: (response) => {
            if (response.status) {
              document.getElementById(orderId + proId).innerHTML = status;
              if (
                status == "pending" ||
                status == "placed" ||
                status == "shipped" ||
                status == "delivered" ||
                status == "canceled"
              ) {
                location.reload();
              }
            }
          },
        });
      } else {
        location.reload();
      }
    }
  );
}


function orderstatusChange(orderId,userId) {
  console.log(orderId);
  console.log(userId);
  var status = document.getElementById(orderId + userId).value;
  swal(
    {
      title: "Are you sure?",
      text: "Do you want to " + status + " the order",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, " + status + " it!",
      cancelButtonText: "No!",
      closeOnConfirm: true,
      closeOnCancel: true,
    },
    function (isConfirm) {
      if (isConfirm) {
        $.ajax({
          url: "/admin/offer-order-status",
          data: {
            orderId,
            status
          },
          method: "post",
          success: (response) => {
            if (response.status) {
              document.getElementById(orderId).innerHTML = status;
              if (
                status == "pending" ||
                status == "placed" ||
                status == "shipped" ||
                status == "delivered" ||
                status == "canceled"
              ) {
                location.reload();
              }
            }
          },
        });
      } else {
        location.reload();
      }
    }
  );
}
// Add to wishlist
function addToWishlist(proId) {
  $.ajax({
    url: '/add-to-wishlist/' + proId,
    method: 'get',
    success: (response) => {
      if (response.status) {
        location.reload()
        document.getElementById('add' + proId).classList.add("d-none")
        document.getElementById('remove' + proId).classList.remove("d-none")

      } else {
        location.reload()
        document.getElementById('remove' + proId).classList.add("d-none")
        document.getElementById('add' + proId).classList.remove("d-none")

      }

    }

  })

}


//SALES REPORT
function salesReport(days, buttonId) {
  $.ajax({
    url: '/admin/sales-report/' + days,
    method: 'get',
    success: (response) => {
      if (response) {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
          button.classList.remove('active');
        });
        document.getElementById(buttonId).classList.add("active");
        document.getElementById('days').innerHTML = buttonId
        document.getElementById('deliveredOrders').innerHTML = response.deliveredOrders
        document.getElementById('shippedOrders').innerHTML = response.shippedOrders
        document.getElementById('placedOrders').innerHTML = response.placedOrders
        document.getElementById('canceledOrders').innerHTML = response.canceledOrders
        document.getElementById('cashOnDelivery').innerHTML = response.cashOnDelivery
        document.getElementById('onlinePayment').innerHTML = response.onlinePayment
        document.getElementById('users').innerHTML = response.users
      }
    }
  })
}

//PDF AND EXCEL
$(document).ready(function ($) {
  $(document).on('click', '.btn_print', function (event) {
    event.preventDefault();
    var element = document.getElementById('container_content');
    let randomNumber = Math.floor(Math.random() * (10000000000 - 1)) + 1;
    var opt =
    {
      margin: 0,
      filename: 'pageContent_' + randomNumber + '.pdf',
      html2canvas: { scale: 10 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  });
});

function export_data() {
  let data = document.getElementById('container_content');
  var fp = XLSX.utils.table_to_book(data, { sheet: 'vishal' });
  XLSX.write(fp, {
    bookType: 'xlsx',
    type: 'base64'
  });
  XLSX.writeFile(fp, 'test.xlsx');
}


window.addEventListener('load', () => {
  histogram(1, 'daily')
})


function histogram(days, buttonId) {

  $.ajax({
    url: '/admin/dashboard/' + days,
    method: 'get',
    success: (response) => {
      if (response) {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
          button.classList.remove('active');
        });
        document.getElementById(buttonId).classList.add("active");

        let totalOrder = response.deliveredOrders + response.shippedOrders + response.placedOrders

        document.getElementById('totalOrders').innerHTML = totalOrder
        document.getElementById('totalAmount').innerHTML = response.totalAmount

        var xValues = ["Delivered", "Shipped", "Placed", "Pending", "Canceled"];
        var yValues = [response.deliveredOrders, response.shippedOrders, response.placedOrders, response.pendingOrders, response.canceledOrders];
        var barColors = ["green", "blue", "orange", "brown", "red"];

        new Chart("order", {
          type: "bar",
          data: {
            labels: xValues,
            datasets: [{
              backgroundColor: barColors,
              data: yValues
            }]
          },
          options: {
            legend: { display: false },
            title: {
              display: true,
              text: "Order Report"
            }
          }
        });


        var xValues = ["COD", "ONLINE"];
        var yValues = [response.codTotal, response.onlineTotal];

        var barColors = [
          "#b91d47",
          "#00aba9",
        ];

        new Chart("payment", {
          type: "pie",
          data: {
            labels: xValues,
            datasets: [{
              backgroundColor: barColors,
              data: yValues
            }]
          },
          options: {
            title: {
              display: true,
              text: "Payment Report"
            }
          }
        });
      }
    }
  })
}

function discountChange(category, id) {
  var discountvalue = document.getElementById(category).value
  console.log(discountvalue);
  $.ajax({
    url: "/admin/categoryOffer",
    data: {
      discountvalue,
      category
    },
    method: "post",
    success: (response) => {
      if (response) {
        document.getElementById(id).innerHTML = response.discountvalue,
          location.reload();
      }
    }
  })
}

function productdiscount(product, id) {
  var productdiscount = document.getElementById(product).value
  $.ajax({
    url: "/admin/productOffers",
    data: {
      productdiscount,
      product
    },
    method: "POST",
    success: (response) => {
      if (response) {
        document.getElementById(id).innerHTML = response.productdiscount,
          location.reload()
      }
    }
  })
}



$('#addcoupon').submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/admin/add-coupon",
    method: 'post',
    data: $('#addcoupon').serialize(),
    success: (response) => {
      if (response.status) {
        location.reload();
      } else {
        swal({
          title: 'There is already a coupon in this code',
          icon: 'warning',
          timer: 1000
        })
      }
    }
  })
})


function deleteCoupon(coupon) {
  console.log(coupon)
  swal(
    {
      title: "Are you sure?",
      text: "Do you want to delete this coupon",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes",
      cancelButtonText: "No!",
      closeOnConfirm: true,
      closeOnCancel: true,
    },
    function (isConfirm) {
      if (isConfirm) {
        $.ajax({
          url: '/admin/delete-coupon',
          data: { coupon },
          method: 'post',
          success: (success) => {

            location.reload();
          },
        });
      }
    }
  );
}

$('#redeem-coupon').submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/redeem-coupon",
    method: 'post',
    data: $('#redeem-coupon').serialize(),
    success: (response) => {
      if (!response.msg) {
        $('#coupon-condition').text("")
        $('#coupon-form').css('border-color', 'green')
        $('.final-amount').text(response.total)
        $('#coupon-offer').text(response.offer)
        $('#totalCheckoutAmount').val(response.total)
        document.getElementById('couponform').style.display = 'none'
        document.getElementById('coupon-name').value = response.coupon
      } else {
        $('#coupon-condition').text(response.msg)
        $('#coupon-form').css('border-color', 'red')
        $('#final-amount').text(response.total)
        $('#coupon-offer').text(response.offer)
        $('#totalCheckoutAmount').val(response.total)
        setTimeout(function () {
          window.location.reload();
        }, 500);
      }

    }
  })
})

function returnProduct(id, item) {
  console.log(id, item)
  swal({
    title: "Reason for return",
    type: "input",
    showCancelButton: true,
    closeOnConfirm: false,
    animation: "slide-from-top",
    inputPlaceholder: "Please enter the reason"
  },
    function (inputValue) {
      if (inputValue === null)
        return false;

      if (inputValue === "") {
        swal.showInputError("You need to write something!");
        return false
      }
      $.ajax({
        url: '/return-product',
        data: { id, item },
        method: 'post',
        success: (response) => {
          if (response.status) {
            location.href = '/orders'
          }
        },
      })
      swal("Your response is recorded");
    });

}



function returnProducts(id, item) {
  console.log(id, item)
  swal({
    title: "Reason for return",
    type: "input",
    showCancelButton: true,
    closeOnConfirm: false,
    animation: "slide-from-top",
    inputPlaceholder: "Please enter the reason"
  },
    function (inputValue) {
      if (inputValue === null)
        return false;

      if (inputValue === "") {
        swal.showInputError("You need to write something!");
        return false
      }
      $.ajax({
        url: '/return-products',
        data: { id, item },
        method: 'post',
        success: (response) => {
          if (response.status) {
            location.href = '/orders'
          }
        },
      })
      swal("Your response is recorded");
    });

}


$("#checkout-form").submit((e) => {
  e.preventDefault()
  $.ajax({
    url: '/place-orders',
    method: 'post',
    data: $('#checkout-form').serialize(),
    success: (response) => {
      if (response.codSuccess || response.walletSuccess) {
        swal({
          title: "Order Placed ",
          type: 'success',
          text: "congratulations!! ",
          icon: "success",
          confirmButtonColor: "#318a2c",
          confirmButtonText: "Click here to See the Orders!",
          closeOnConfirm: false
        },
          function (isConfirm) {
            if (isConfirm) {
              location.href = '/orders'
            }
          });
      } else if (response.walletFailure) {
        swal({
          title: 'Your wallet has not enough amount',
          icon: 'warning',
          timer: 1000
        })
      }
      else {
        razorpayPayment(response)
      }

    }
  })
})
function razorpayPayment(order) {
  var options = {
    "key": process.env.KEY_ID, // Enter the Key ID generated from the Dashboard
    "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    "currency": "INR",
    "name": "Goal Cart",
    "description": "Test Transaction",

    "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    "handler": function (response) {
      verifyPayment(response, order)
    },
    "prefill": {
      "name": "Gaurav Kumar",
      "email": "gaurav.kumar@example.com",
      "contact": "9999999999"
    },
    "notes": {
      "address": "Razorpay Corporate Office"
    },
    "theme": {
      "color": "#3399cc"
    }
  };
  var rzp1 = new Razorpay(options);
  rzp1.open();
}
function verifyPayment(payment, order) {
  $.ajax({
    url: '/verify-payment',
    data: {
      payment, order
    },
    method: 'post',
    success: (respone) => {
      if (respone.status) {
        location.href = '/orders'
      } else {
        alert("Payment Failed. Try again later")
      }
    }
  })
}