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
        let { title, description, price, currencyId, currencyFormat, availableSizes, style } = data

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

        let checkTitle = await productModel.findOne({ title: title })
        if (checkTitle) {
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

const getProduct = async function (req, res) {
    try {
        let body = req.query

        let filter = {isDeleted: false};

        let { name, size, priceGreaterThan, priceLessThan ,priceSort } = body

        if (name !== undefined) {
            const regName = new RegExp(name, "i")
            filter.title = {$regex: regName}
        }

        if(priceGreaterThan){
            filter.price = {$gt : priceGreaterThan}
        }
        if(priceLessThan){
            filter.price = {$lt : priceLessThan}
        }

        if(size){
            filter.availableSizes = size
        }

        // if(priceSort){
        //     console.log(priceSort)
        //     filter.price = price
        //     if(priceSort=="1"){
        //         filter.price = price.sort(1) 
        //     }
        //     if(priceSort=="-1"){
        //         filter.priceSort = price.sort(-1) 
        //     }
        //     return res.status(400).send({
        //         status: false,
        //         message: "this is wrong input in priceSort, put 1 for ascending order and put -1 for descending"
        //     })
        // } 

        // if(priceSort){
        //     console.log(priceSort);

        //    let sort = priceSort.sort((a, b) => {
        //         if (a.price < b.price)
        //           return -1;
        //         if (a.region > b.region)
        //           return 1;
        //         return 0;
        //       })
        // }

        const getBooks = await productModel.find(filter)
        if(getBooks.length ==0){
            return res.status(404).send({
                status: false,
                message: "product not found"
            })
        }
        if (getBooks.length == 0)
            return res.status(404).send({ status: false, message: "No product is found" });

        //sort alphabetically
        // if(priceSort){
        //     if(priceSort=="1"){
                
        //         getBooks.sort(function (a, b) {
                    
        //             if (a.price < b.price) { 
        //                 console.log(priceSort)
        //                 return getBooks; 
        //             }
        //             if (a.price > b.price) { 
        //                 return getBooks; 
        //             }
        //             return "aalu";
        //         });
        //     }
        // }

        return res.status(200).send({ status: true, Products: getBooks })
    }
    catch (err) {
        return res.status(500).send({
            status: false,
            error: err.message
        })
    }
}


//*******get product by Id */

const getproductbyId = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!valid.isValidObjectId(productId)) {
            return res.status(400).send({
                status: false,
                message: "the given productId in invalid"
            })
        }

        let checkProductId = await productModel.findById({ _id: productId })
        if (!checkProductId) {
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
            obj["availableSizes"] = availableSizes.trim().split(" ").filter(x => x).join(" ")
        }

        if (installments) {
            if (!valid.isValid(installments)) {
                return res.status(400).send({
                    status: false,
                    message: "installments should be in string format and can't be a any white spaces"
                })
            }
            obj["installments"] = installments.trim().split(" ").filter(x => x).join(" ")
        }

        const updatedProduct = await productModel.findByIdAndUpdate({ _id: productId, isDeleted: false }, { $set: obj }, { new: true })
        if (!updatedProduct) {
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

        if (!valid.isValidObjectId(productId)) {
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


    } catch (error) {

        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { createProduct, getProduct, getproductbyId, updateProductById, deletProductById }

