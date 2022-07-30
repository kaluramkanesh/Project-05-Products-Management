const productModel = require("../Models/productModel")
const valid = require("../validations/validation")
const aws = require("aws-sdk")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId


aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  //HERE
            Key: "abc/" + file.originalname, //HERE 
            Body: file.buffer
        }

        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            // console.log("file uploaded succesfully")
            return resolve(data.Location)
        })
    })
}

// ******************* POST /products */

const createProduct = async function (req, res) {
    try {
        let data = req.body
        let { title, description, price, currencyId, currencyFormat, availableSizes, style, installments } = data

        //******for product image inserting */
        let files = req.files

        if (!files || files.length == 0) return res.status(400).send({
            status: false, message: "no cover image found"
        })
        let productImage = await uploadFile(files[0])
        data.productImage = productImage


        // ----------check if body is empty
        if (Object.keys(data).length === 0) {
            return res.status(400).send({
                status: false,
                message: "Body should not be empty please provide some data for create product"
            })
        }

        // --------------------------the validation for mendatory field

        if (!valid.isValid(title)) {
            return res.status(400).send({
                status: false,
                message: "title is required"
            })
        }

        let checkTitle = await productModel.findOne({title:title})
        if(checkTitle){
            return res.status(400).send({
                status: false,
                message: "title is already present in the DB"
            })
        }

        if (!valid.titleValidationRegex(title)) {
            return res.status(400).send({
                status: false,
                message: "please enter valid title"
            }) //** check
        }

        if (!valid.isValid(description)) {
            return res.status(400).send({
                status: false,
                message: " description is required"
            }) //**check
        }

        if (!valid.isValid(price)) {
            return res.status(400).send({
                status: false,
                message: "price is required"
            })
        }

        if (!valid.priceValidationRegex(price)) {
            return res.status(400).send({
                status: false,
                message: "please enter valid price"
            })
        }

        if (!valid.isValid(currencyId)) {
            return res.status(400).send({
                status: false,
                message: "currencyId is required"
            })  //**check
        }
        if (currencyId !== "INR" || currencyId === "undifined") {
            return res.status(400).send({
                status: false,
                msg: "you have to put only one currencyId : INR, or it is already present"
            })
        }

        if (!valid.isValid(currencyFormat)) {
            return res.status(400).send({
                status: false,
                message: " currency format required "
            }) //**check
        }
        if (currencyFormat !== "₹" || currencyFormat === "undifined") {
            return res.status(400).send({
                status: false,
                msg: "you have to put only one currencyFormat : ₹, or it is already present"
            })
        }

        if (!valid.isValid(productImage)) {
            return res.status(400).send({
                status: false,
                message: " product image required"
            }) //** cheack
        }

        if (!valid.isValid(availableSizes)) {
            return res.status(400).send({
                status: false,
                message: "please select size"
            })
        }

        data.availableSizes = availableSizes.split(',').map(x => x.trim().toUpperCase())

        // if (availableSizes.map(x => valid.isValidSize(x)).filter(x => x === false).length !== 0) {
        //     return res.status(400).send({ status: false, msg: "Size should be Among  S, XS, M, X, L, XXL, XL" })
        // }

        if (valid.isValidSize(availableSizes)) {
            console.log(availableSizes)

            return res.status(400).send({
                status: false,
                message: `Size should be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}`
            })
        }

        data.availableSizes = availableSizes.split(',').map(x => x.trim().toUpperCase())


        if (!valid.isValid(style)) {
            return res.status(400).send({
                status: false,
                message: "style is in string format"
            })
        }

        if (!valid.isValid(installments)) {
            return res.status(400).send({
                status: false,
                message: "installments is in string format"
            })
        }

        const productCreated = await productModel.create(data)
        return res.status(201).send({
            status: true, message: " product created successfully",
            data: productCreated
        })
    }
    catch (err) {
        return res.status(500).send({ 
            status: false, 
            error: err.message 
        })
    }
}


//-----------------------getproduct

// const getProduct = async function (req, res) {
//     try {
//         let body = req.query

//         let { title, availableSizes } = body
//         // let filterQuery = { isDeleted: true }
//         //check the title is valid
//         if (title !== undefined) {
//             if (!valid.titleValidationRegex(title)) {
//                 return res.status(400).send({ status: false, message: "please enter valid name" }) //** check
//             }
//         }
//         //check the size value is present
//         if (availableSizes !== undefined) {
//             if (!valid.isValidSize(availableSizes)) {
//                 return res.status(400).send({ status: false, message: "please enter valid size" }) //** check
//             }
//         }

//         let filter = {
//             ...body,
//             isDeleted: false
//         };

//         const Getbooks = await productModel.find(filter)
//             // console.log(findFilterProduct)

//             if (Getbooks.length == 0)
//             return res.status(404).send({ status: false, message: "No product is found" });

//         //sort alphabetically
//         Getbooks.sort(function (a, b) {
//             const nameA = a.title;
//             const nameB = b.title;
//             if (nameA < nameB) { return -1; }
//             if (nameA > nameB) { return 1; }
//             return 0;
//         });
//         let findFilterProduct = await productModel.find({ isDeleted: false })

//         if (findFilterProduct.length == 0) { return res.status(404).send({ status: false, Products: "Product's not available.... cool down, we will add product's soon........😎😎😎😎😎😎😎😎" }) }
//         let arr = []
//         for (let i = 0; i < findFilterProduct.length; i++) {
//             if (findFilterProduct[i].price >= 1000 && findFilterProduct[i].price <= 1000) {
//                 arr.push(findFilterProduct[i])
//             }
//         }
//         body.findFilterProduct = findFilterProduct

//         return res.status(200).send({ status: true, Products: Getbooks })
//     }
//     catch (err) {
//         return res.status(500).send({
//             status: false,
//             error: err.message
//         })
//     }
// }


// //*******get product by Id */


/************************************Start's Get Product ****************************/

const getProduct = async function (req, res) {
    try {
        let body = req.query

        let filter = { isDeleted: false };

        let { name, size, priceGreaterThan, priceLessThan, priceSort } = body

        if (name !== undefined) {
            const regName = new RegExp(name, "i")
            filter.title = { $regex: regName }
        }

        if (priceGreaterThan) {
            filter.price = { $gt: priceGreaterThan }
        }
        if (priceLessThan) {
            filter.price = { $lt: priceLessThan }
        }

        if (size) {
            filter.availableSizes = size
        }

        const getBooks = await productModel.find(filter)
        if (getBooks.length == 0) {
            return res.status(404).send({
                status: false,
                message: "product not found"
            })
        }

        if (priceSort) {
            if (priceSort != 1 && priceSort != -1)
                return res.status(400).send({ 
                    status: false, 
                    message: "this is wrong input in priceSort, put 1 for ascending order and put -1 for descending" 
                })
            if (priceSort == 1) {
                const products = await productModel.find(filter).sort({ price: 1 })
                if (products.length == 0) return res.status(404).send({ 
                    status: false, 
                    message: 'No products found' 
                })
                return res.status(200).send({ 
                    status: true, 
                    message: 'Success', 
                    data: products 
                })
            }
            if (priceSort == -1) {
                const products = await productModel.find(filter).sort({ price: -1 })
                if (!products.length) return res.status(404).send({ 
                    status: false, 
                    message: 'No products found' 
                })
                return res.status(200).send({ 
                    status: true, 
                    message: 'Success', 
                    data: products 
                })
            }
        }
        return res.status(200).send({ 
            status: true, 
            Products: getBooks 
        })
    }
    catch (err) {
        return res.status(500).send({
            status: false,
            error: err.message
        })
    }
}

/****************************************End Get Product ************************************/





// const getProductByQuery = async (req, res) => {
//     try {
//         const filterQuery = { isDeleted: false }

//         const data = req.query
//         // -----------------DESTRUCTURING requestBody---------------------
//         let { size, name, priceGreaterThan, priceLessThan, priceSort } = data

//         // ------------CHECKING and VALIDATING every key to get the product details------------
//         if (size) {

//             if (!valid.isValidSize(size)) return res.status(400).send({ status: false, message: `Size should be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })

//             filterQuery['availableSizes'] = size
//         }

//         if (name) {

//             if (!valid.nameValidationRegex(name)) return res.status(400).send({ status: false, message: 'name is invalid' })

//             filterQuery['title'] = name
//         }

//         if (priceGreaterThan && priceLessThan) {

//             if (!(valid.priceValidationRegex(priceGreaterThan) || valid.priceValidationRegex(priceLessThan)))

//                 return res.status(400).send({ status: false, message: "Price must be a valid number" })

//             filterQuery['price'] = { $gte: priceGreaterThan, $lte: priceLessThan }

//         }

//         else if (priceGreaterThan) {

//             if (!valid.priceValidationRegex(priceGreaterThan)) return res.status(400).send({ status: false, message: "Price must be a valid number" })

//             filterQuery['price'] = { $gte: priceGreaterThan }

//         }

//         else if (priceLessThan) {

//             if (!valid.priceValidationRegex(priceLessThan)) return res.status(400).send({ status: false, message: "Price must be a valid number" })

//             filterQuery['price'] = { $lte: priceLessThan }

//         }

//         if (priceSort) {

//             if (priceSort != 1 && priceSort != -1)

//                 return res.status(400).send({ status: false, message: "Please provide only 1 for ascending or -1 for descending" })

//             if (priceSort == 1) {

//                 const products = await productModel.find(filterQuery).sort({ price: 1 })

//                 if (products.length == 0) return res.status(404).send({ status: false, message: 'No products found' })

//                 return res.status(200).send({ status: true, message: 'Success', data: products })

//             }
//             if (priceSort == -1) {

//                 const products = await productModel.find(filterQuery).sort({ price: -1 })

//                 if (!products.length) return res.status(404).send({ status: false, message: 'No products found' })

//                 return res.status(200).send({ status: true, message: 'Success', data: products })

//             }
//         }
//         // -------------------------VALIDATION ends here-------------------------

//         const products = await productModel.find(filterQuery)

//         if (!products) return res.status(404).send({ status: false, message: 'No products found' })

//         return res.status(200).send({ status: true, message: "Success", data: products })

//     }
//     catch (err) {

//         return res.status(500).send({ Error: err.message })

//     }
// }



/*********************************Start's Get Product ById Function *****************************************/

const getproductbyId = async function (req, res) {
    try {
        let productId = req.params.productId

        if(!valid.isValidObjectId(productId)){
            return res.status(400).send({
                status: false,
                message: "the given productId in invalid"
            }) 
        }

        let checkProductId = await productModel.findById({_id : productId})
        if(!checkProductId){
            return res.status(404).send({
                status: false,
                message: "no data availabe for this Id"
            })   
        }

        return res.status(200).send({
            status: true,
            message: "the product details for given productId",
            data: checkProductId
        })
    }
    catch (err) {
        return res.status(500).send({
            status: false,
            error: err.message
        })
    }
}


//**************put api */


const updateProductById = async function (req, res) {
    try {

        let data = req.body
        let productId = req.params.productId

        let obj = {}

        let checkProductId = await productModel.findById({ _id: productId, isDeleted: false })
        if (!checkProductId) {
            return res.status(404).send({
                status: false,
                message: "productId not find"
            })
        }

        let { title, description, price, currencyId, currencyFormat, productImage, style, availableSizes, installments } = data

        if (Object.keys(data).length == 0) {
            return res.status(400).send({
                status: false,
                message: "please put atleast one key for updating"
            })
        }

        if (!valid.isValidObjectId(productId)) {
            return res.status(400).send({
                status: false,
                message: "invalid product Id"
            })
        }

        if (title) {
            if (!valid.isValid(title)) {
                return res.status(400).send({
                    status: false,
                    message: "title should be in string format and can't be a any white spaces"
                })
            }
            if (!valid.titleValidationRegex(title)) {
                return res.status(400).send({
                    status: false,
                    message: "title "
                })
            }
            obj["title"] = title.trim().split(" ").filter(x => x).join(" ")
        }

        if (description) {
            if (!valid.isValid(description)) {
                return res.status(400).send({
                    status: false,
                    message: "description should be in string format and can't be a any white spaces"
                })
            }
            obj["description"] = description.trim().split(" ").filter(x => x).join(" ")
        }

        if (price) {
            if (!valid.isValid(price)) {
                return res.status(400).send({
                    status: false,
                    message: "description should be in string format and can't be a any white spaces"
                })
            }
            obj["price"] = price.trim().split(" ").filter(x => x).join(" ")
        }

        if (currencyId) {
            if (!valid.isValid(currencyId)) {
                return res.status(400).send({
                    status: false,
                    message: "currencyId should be in string format and can't be a any white spaces"
                })
            }
            if (currencyId !== "INR" || currencyId === "undifined") {
                return res.status(400).send({
                    status: false,
                    msg: "you have to put only one currencyId : INR, or it is already present"
                })
            }
            obj["currencyId"] = currencyId.trim().split(" ").filter(x => x).join(" ")
        }

        if (currencyFormat) {
            if (!valid.isValid(currencyFormat)) {
                return res.status(400).send({
                    status: false,
                    message: "currencyFormat should be in string format and can't be a any white spaces"
                })
            }
            if (currencyFormat !== "₹" || currencyFormat === "undifined") {
                return res.status(400).send({
                    status: false,
                    msg: "you have to put only one currencyFormat : ₹, or it is already present"
                })
            }
            obj["currencyFormat"] = currencyFormat.trim().split(" ").filter(x => x).join(" ")
        }

        if (productImage) {
            if (!valid.isValid(productImage)) {
                return res.status(400).send({
                    status: false,
                    message: "productImage should be in string format and can't be a any white spaces"
                })
            }
        }

        if (style) {
            if (!valid.isValid(style)) {
                return res.status(400).send({
                    status: false,
                    message: "style should be in string format and can't be a any white spaces"
                })
            }
            obj["style"] = style.trim().split(" ").filter(x => x).join(" ")
        }

        if (availableSizes) {
            if (!valid.isValid(availableSizes)) {
                return res.status(400).send({
                    status: false,
                    message: "style should be in string format and can't be a any white spaces"
                })
            }
            obj["availableSizes"] = availableSizes.trim().toUpperCase().split(" ").filter(x => x).join(" ")
        }
        
        //   obj["availableSizes"] = availableSizes.split(',').map(x => x.trim().toUpperCase())
        // if (availableSizes.map(x => valid.isValidSize(x)).filter(x => x === false).length !== 0){
        //     console.log(availableSizes)
        //     return res.status(400).send({ status:false, msg: "Size should be Among  S, XS, M, X, L, XXL, XL"})
        // }

        if (installments) {
            if (!valid.isValid(installments)) {
                return res.status(400).send({
                    status: false,
                    message: "installments should be in string format and can't be a any white spaces"
                })
            }
            obj["installments"] = installments.trim().split(" ").filter(x => x).join(" ")
        }

        const updatedProduct = await productModel.findByIdAndUpdate({ _id: productId, isDeleted: false }, { $set: obj }, {new : true})
        if(!updatedProduct){
            return res.status(404).send({
                status: false,
                message: "product is already deleted or not found",
                data: updatedProduct
            })
        }
        // console.log(updatedProduct)
        return res.status(400).send({
            status: false,
            message: "successfully updated data",
            data: updatedProduct
        })

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//----------------------deletProduct------------------------

const deletProductById = async function (req, res) {

    try {

        let productId = req.params.productId;
        
       if (!valid.isValidObjectId(productId) ) {
            return res.status(400).send({ 
                status: false, 
                message: "productId not valid" 
            })
        }

        let findProduct = await productModel.findOne({ _id: productId, isDeleted: false })  //{ new: true 

        if (!findProduct) {
            return res.status(404).send({ 
                status: false, 
                message: " product is already deleted or not found" 
            })
        }

        let updatedProduct = await productModel.findOneAndUpdate({ _id: productId }, { isDeleted: true, deletedAt: new Date() }, { new: true })


        return res.status(200).send({ status: true, message: " successfully deleted" })


        return res.status(200).send({ status: true, message: " successfully deleted" })

    } catch (error) {

        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { createProduct, getProduct, getproductbyId, updateProductById, deletProductById }

