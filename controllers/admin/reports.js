const adminHelpers = require("../../helpers/admin-helpers");
const cloudinary = require('../../utils/cloudinary')

exports.dashboard = (req, res) => {
  res.render("admin/dashboard", { admin: true });
}

exports.dashboardDaywise = (req, res) => {
  adminHelpers.dashboardCount(req.params.days).then((data) => {
    res.json(data)
  })
}

exports.salesReport = async (req, res) => {
  console.log(req.query.month, '1111111111111111111111111');
  if (req.query?.month) {
    let month = req.query?.month.split("-")
    let [yy, mm] = month;

    deliveredOrders = await adminHelpers.deliveredOrderList(yy, mm)
  } else if (req.query?.daterange) {
    deliveredOrders = await adminHelpers.deliveredOrderList(req.query);
  } else {
    deliveredOrders = await adminHelpers.deliveredOrderList();
  }
  res.render('admin/salesreport', { admin: true, deliveredOrders })
}

exports.banner = (req, res) => {
  res.render('admin/banner', { admin: true })
}

exports.addBanner = async (req, res) => {
  console.log(req.files);
  const cloudinaryImageUploadMethod = (file) => {
    return new Promise((resolve) => {
      cloudinary.uploader.upload(file, (err, res) => {
        console.log(err, " asdfgh");
        if (err) return res.status(500).send("Upload Image Error")
        resolve(res.secure_url)
      })
    })
  }

  const files = req.files
  let arr1 = Object.values(files)
  let arr2 = arr1.flat()
  const urls = await Promise.all(
    arr2.map(async (file) => {
      const { path } = file
      const result = await cloudinaryImageUploadMethod(path)
      return result
    })
  )
  console.log(urls);

  adminHelpers.addBanner(req.body, urls).then(() => {
    res.redirect('/admin/banner')
  })
}


exports.editBanner = async (req, res) => {
  let banner = await adminHelpers.getBanner()
  // console.log(banner,'44444444444444444444444444444');
  res.render('admin/edit-banner', { banner, admin: true })
}


exports.postEditBanner = async (req, res) => {
  console.log(req.files, 'aaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbb');

  let img = {}
  if (req.files.image1) {
    img.img1 = true
  } else {
    img.img1 = false
  }
  if (req.files.image2) {
    img.img2 = true
  } else {
    img.img2 = false
  }
  if (req.files.image3) {
    img.img3 = true
  } else {
    img.img3 = false
  }



  const cloudinaryImageUploadMethod = (file) => {
    console.log("dfghjkl;kjhgfdfghjkjhgfdfghj");
    return new Promise((resolve) => {
      cloudinary.uploader.upload(file, (err, res) => {
        console.log(err, "vbnm,jnhbgvcvbnm,");
        if (err) return res.status(500).send("Upload Image Error")
        resolve(res.secure_url)
      })
    })
  }

  const files = req.files
  let arr1 = Object.values(files)
  let arr2 = arr1.flat()
  const urls = await Promise.all(
    arr2.map(async (file) => {
      const { path } = file
      const result = await cloudinaryImageUploadMethod(path)
      return result
    })
  )
  console.log(urls);

  adminHelpers.editBanner(urls, img).then((id) => {
    res.redirect('/admin/banner')
  })
}