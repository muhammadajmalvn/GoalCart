const collection = require("../../config/collection");
const adminHelpers = require("../../helpers/admin-helpers");
const productHelpers = require("../../helpers/product-helpers");
const cloudinary = require('../../utils/cloudinary')



//------------------------PRODUCTS VIEW PAGE----------------------- 
exports.productsView = async (req, res) => {
    const pageNo = (req.query.p) ? (req.query.p - 1) : 0;
    adminHelpers.pagination(collection.PRODUCT_COLLECTION).then((pages) => {
        productHelpers.getAllProducts(pageNo).then(([products, limit]) => {
            let admin = req.session.admin;
            let indice = parseInt(pageNo * limit)
            let count = products.length
            console.log(count);


            for (i = 0; i < count; i++) {
                products[i].number = indice + (i + 1)
            }

            res.render("admin/products", { products, pages, admin, admin: "true" });
        });
    })
}

//------------------------ADD PRODUCTS ---------------------------------
exports.addProduct = async (req, res) => {
    let admin = req.session.admin;
    let category = await adminHelpers.getCategory();
    res.render("admin/add-products", { category, admin, admin: "true" });
}

exports.postAddProduct = async (req, res) => {
    console.log(req.files);
    const cloudinaryImageUploadMethod = (file) => {
        console.log("qwertyui");
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

    productHelpers.addProduct(req.body, urls, (id) => {
        res.redirect('/admin/products')
    })
}

//--------------------------------EDIT PRODUCT---------------------
exports.editProduct = async (req, res) => {
    let product = await productHelpers.getProductDetails(req.params.id);
    let category = await adminHelpers.getCategory();
    let admin = req.session.admin;
    res.render("admin/edit-products", { product, category, admin, admin: "true" })
}

//---------------------------------------------------------------------------

// exports.postEditProduct = async (req, res) => {
//     console.log(req.body);
//     var oldImages = await productHelpers.getProductImage(req.params.id)
//     oldImages = oldImages.image
//     console.log(req.files, '123456789000');
    // console.log(req.files.image1, '123456789000');

//     if (req.files.image1 || req.files.image2 || req.files.image3 || req.files.image4) {

//         const cloudinaryImageUploadMethod = async (file) => {
//             return new Promise((resolve) => {
//                 cloudinary.uploader.upload(file, (err, res) => {
//                     if (err) return res.status(500).send("upload image error");
//                     resolve(res.secure_url);
//                 });
//             });
//         };

//         const urls = [];
//         const files = req.files;
//         if (files) {
//             for (const file of files) {
//                 const { path } = file;
//                 const newPath = await cloudinaryImageUploadMethod(path);
//                 urls.push(newPath);
//             }
//         }


//         oldImages.splice(0, urls.length, ...urls);
//     }

//     productHelpers.editProduct(req.params.id, req.body, oldImages).then(() => {
//         res.redirect('/admin/products')
//     })
// }

//-------------------------------------------------------------------------------


// exports.postEditProduct = async (req, res) => {
//     var oldImages = await productHelpers.getProductImage(req.params.id)
//     console.log(req.files);
//     let urls = oldImages.image
//     oldImages = oldImages.image
//     if (req.files.image1 || req.files.image2 || req.files.image3 || req.files.image4) {
//         const cloudinaryImageUploadMethod = (file) => {
//             console.log("qwertyui");
//             return new Promise((resolve) => {
//                 cloudinary.uploader.upload(file, (err, res) => {
//                     console.log(err, " asdfgh");
//                     if (err) return res.status(500).send("Upload Image Error")
//                     resolve(res.secure_url)
//                 })
//             })
//         }

//         const files = req.files
//         let arr1 = Object.values(files)
//         let arr2 = arr1.flat()
//         urls = await Promise.all(
//             arr2.map(async (file) => {
//                 const { path } = file
//                 const result = await cloudinaryImageUploadMethod(path)
//                 return result
//             })
//         )

//     } else{
//         urls = oldImages
//     }
//     console.log(urls.length);
//     oldImages.splice(0, urls.length, ...urls);
//     console.log(oldImages,'finallllllllllllllllllllllllllllllllll');
//     productHelpers.editProduct(req.params.id, req.body, oldImages).then((id) => {
//         res.redirect('/admin/products')
//     })
// }

exports.postEditProduct = async (req, res) => {
    console.log(req.files, 'aaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbb');

    let img = {}
    if (req.files.image1) {
img.img1= true
    }else{
        img.img1= false
    }
    if(req.files.image2)
    {
        img.img2 = true
    }else{
        img.img2 = false
    }
    if(req.files.image3){
        img.img3= true
    }else{
        img.img3 = false
    }
    if(req.files.image4){
            img.img4 = true
    }else{
        img.img4 = false
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

    productHelpers.editProduct(req.params.id, req.body, urls,img).then((id) => {
        res.redirect('/admin/products')
    })
}




//---------------------------DELETE PRODUCT-----------------------------
exports.deleteProduct = (req, res) => {
    let prodId = req.params.id;
    productHelpers.deleteProduct(prodId).then((response) => {
        res.redirect("/admin/products");
    });
}




