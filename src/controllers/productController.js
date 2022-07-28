const productModel = require("../Models/productModel")
const valid = require("../validations/validation")
const aws = require("aws-sdk")


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
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style } = data

        let files = req.files
        if (!files || files.length == 0) return res.status(400).send({
            status: false, 
            message: "no cover image found"
        })

        let productImage = await uploadFile(files[0])
        // console.log(productImage)
        data.productImage = productImage

        // ----------check if body empty

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

        let aalu = await productModel.findOne({ title: title })
        if (aalu) {
            return res.status(400).send({ 
                status: false, 
                message: "title is allready exist" 
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
                status: false, message: " description is required" 
            }) //**check

        }

        if (!valid.isValid(price)) {
            return res.status(400).send({ 
                status: false, 
                message: "price is required" 
            })
        }

        // if (!valid.priceValidationRegex(price)){
        //     return res.status(400).send({status: false , message : "please enter valid price"})
        // }


        if (!valid.isValid(currencyId)) {
            return res.status(400).send({ 
                status: false, 
                message: "currencyId is required" 
            })  //**check
        }

        if (!valid.isValid(currencyFormat)) {
            return res.status(400).send({ 
                status: false, message: " currency format required " 
            }) //**check
        }

        //   if (!valid.isValid(isFreeShipping)){
        //     return res.status(400).send({status: false , message: "this freeshipping  is required "}) //**check
        //   }

        if (!valid.isValid(productImage)) {
            return res.status(400).send({ 
                status: false, message: " product image required" 
            }) //** cheack
        }

        //   if(!valid.isValid(availableSizes)){
        //     return res.status(400).send({status: false , message : "please select size"})
        //   }

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


// *********************** GET /products  */


const getProduct = async function (res, req) {
    try {

        let data = req.body
        let { size, name, price } = data

        if(size){
            let findSize = await productModel.find({size : availableSizes})
            return res.status(200).send({
                status : true,
                message : "the filtered size is",
                data: findSize
            })
        }
        // if(name){

        // }
        // if(price){

        // }

    }
    catch (Err) {
        return res.status(500).send({
            status: false,
            msg: Err.message
        })
    }
}

//-----------------------getproductbyId

const getproductbyId = async function (req, res) {

    try {
        let productId = req.param.productId
        let getProduct = await productModel.findOne({ _id: productId })

        return res.status(200).send({
            status: true, message: "product details" ,
            data: getProduct
        })

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//**************put api */


const updateProductById = async function (req, res){
    try{
    
        let data = req.body
        let productId = req.params.productId

        let checkProductId =await productModel.findById({_id: productId})
        if(!checkProductId){
            return res.status(404).send({
                status: false,
                message: "productId not find"
            })
        }

        let {title, description, price, currencyId, currencyFormat, productImage, style, availableSizes, installments} = data

        if(Object.keys(data).length==0){
            return res.status(400).send({
                status: false,
                message: "please put atleast one key for updating"
            })
        }

        if(!valid.isValidObjectId(productId)){
            return res.status(400).send({
                status: false,
                message: "invalid product Id"
            })
        }

        if(title){
            if(!valid.isValid(title)){
                return res.status(400).send({
                    status: false,
                    message: "title should be in string format and can't be a any white spaces"
                })
            }
            if(!valid.titleValidationRegex(title)){
                return res.status(400).send({
                    status: false,
                    message: "title "
                })
            }
        }

        if(description){
            if(!valid.isValid(description)){
                return res.status(400).send({
                    status: false,
                    message: "description should be in string format and can't be a any white spaces"
                })
            }
        }

        if(price){
            if(!valid.isValid(price)){
                return res.status(400).send({
                    status: false,
                    message: "description should be in string format and can't be a any white spaces"
                })
            }
        }

        if(currencyId){
            if(!valid.isValid(currencyId)){
                return res.status(400).send({
                    status: false,
                    message: "currencyId should be in string format and can't be a any white spaces"
                })
            }
        }

        if(currencyFormat){
            if(!valid.isValid(currencyFormat)){
                return res.status(400).send({
                    status: false,
                    message: "currencyFormat should be in string format and can't be a any white spaces"
                })
            }
        }

        if(productImage){
            if(!valid.isValid(productImage)){
                return res.status(400).send({
                    status: false,
                    message: "productImage should be in string format and can't be a any white spaces"
                })
            }
        }

        if(style){
            if(!valid.isValid(style)){
                return res.status(400).send({
                    status: false,
                    message: "style should be in string format and can't be a any white spaces"
                })
            }
        }

        if(availableSizes){
            if(!valid.isValid(availableSizes)){
                return res.status(400).send({
                    status: false,
                    message: "style should be in string format and can't be a any white spaces"
                })
            }
        }

        if(installments){
            if(!valid.isValid(installments)){
                return res.status(400).send({
                    status: false,
                    message: "installments should be in string format and can't be a any white spaces"
                })
            }
        }

        const updatedProduct = await productModel.findByIdAndUpdate({_id: productId, isDeleted : false}, {$set: data})
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


module.exports = { createProduct ,getProduct, getproductbyId , updateProductById}

