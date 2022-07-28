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
            
        }
        if(name){

        }
        if(price){

        }

    }
    catch (err) {
        return res.status(500).send({
            ststus: false,
            error: err.message
        })
    }
}



module.exports = { createProduct, getProduct }
