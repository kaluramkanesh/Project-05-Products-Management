const productModel = require("../Models/productModel")
const valid = require("../validations/validation")
const aws = require("../util/aws")


/************Start's Create Product  Function **************/

const createProduct = async function (req, res) {
    try {
        let data = req.body
        let { title, description, price, currencyId, currencyFormat, availableSizes, style, installments } = data


        // ----------check if body is empty
        if (Object.keys(data).length == 0 && req.files.length == 0) {
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

        //****for product image inserting */
        let files = req.files
        if (!files || files.length == 0) return res.status(400).send({
            status: false, message: "product image is required and also insert product Image"
        })
        let productImage = await aws.uploadFile(files[0])
        data.productImage = productImage


        if (!valid.isValid(availableSizes)) {
            return res.status(400).send({
                status: false,
                message: "please provide atleast one size among [S, XS, M, X, L, XXL, XL]"
            })
        }
        if (availableSizes) {
            availableSizes = availableSizes.split(",").map(x => x.trim().toUpperCase())
            if (availableSizes) {
                let enumArr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
                let uniqueSizes = [...new Set(availableSizes)]
                for (let i of uniqueSizes) {
                    if (enumArr.indexOf(i) == -1) {
                        return res.status(400).send({ status: false, message: `'${i}' is not a valid size, only these sizes are allowed [S, XS, M, X, L, XXL, XL]` })
                    }
                }
                data.availableSizes = uniqueSizes
            }
        }

        if (style == "") {
            return res.status(400).send({
                status: false,
                message: "please put value in style"
            })
        }

        if (installments != undefined && installments == "") {
            return res.status(400).send({
                status: false,
                message: "please put Number value in installments"
            })
        }

        if (data.installments) {
            if (isNaN(installments)) {
                return res.status(400).send({
                    status: false,
                    message: "please put Number not charactor"
                })
            }
        }


        const productCreated = await productModel.create(data)
        return res.status(201).send({
            status: true, message: "Success",
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

/************End Create Product  Function **************/


/*************Start's Get Product By Query Function*********/

const getProduct = async function (req, res) {
    try {
        let body = req.query

        let filter = { isDeleted: false };

        let { name, size, priceGreaterThan, priceLessThan, priceSort } = body

        if (name !== undefined) {
            const regName = new RegExp(name)    // The RegExp object is used for matching text with a pattern.    
            filter.title = { $regex: regName }       // u (unicode) => Treat pattern as a sequence of Unicode code points..
        }                                            // i (ignore case) => If u flag is also enabled, use Unicode case folding.

        if (priceGreaterThan) {
            filter.price = { $gt: priceGreaterThan }   // $ =>  they identify an object in the same way a name would.         
        }                                              // The objects they identify include things such as variables, functions, properties, events, and objects.
        if (priceLessThan) {
            filter.price = { $lt: priceLessThan }
        }

        if (size) {
            filter.availableSizes = size.toUpperCase()
        }

        const getProducts = await productModel.find(filter)
        if (getProducts.length == 0) {
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
        }
        return res.status(200).send({
            status: true,
            message: 'Success',
            Products: getProducts
        })
    }
    catch (err) {
        return res.status(500).send({
            status: false,
            error: err.message
        })
    }
}

/*************End Get Product By Query Function*************/


/************Start's Get Product ById Function **************/

const getproductbyId = async function (req, res) {
    try {
        const productId = req.params.productId

        if (!valid.isValidObjectId(productId)) {
            return res.status(400).send({
                status: false,
                message: "the given productId in invalid"
            })
        }

        let checkProductId = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!checkProductId) {
            return res.status(404).send({
                status: false,
                message: "data not found for this Id or have deleted"
            })
        }

        return res.status(200).send({
            status: true,
            message: "Success",
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

/************End Get Product ById Function **************/


/************Start's Update Product ById Function **************/


const updateProductById = async function (req, res) {
    try {

        let data = req.body
        const productId = req.params.productId   // JSON.stringify() => method converts a JavaScript object or value to a JSON string
        data = JSON.parse(JSON.stringify(data))  // JSON.parse() => is the process of converting a JSON object in text format to a Javascript object that can be used inside a program.

        if (!valid.isValidObjectId(productId)) {
            return res.status(400).send({
                status: false,
                message: "invalid product Id"
            })
        }

        if (Object.keys(data).length == 0 && !req.files) {
            return res.status(400).send({
                status: false,
                message: "please put atleast one key for updating"
            })
        }

        let obj = {}

        let checkProductId = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!checkProductId) {
            return res.status(404).send({
                status: false,
                message: "productId not found"
            })
        }

        let { title, description, price, currencyId, currencyFormat, style, availableSizes, installments } = data

        if (title) {
            let checkTitle = await productModel.findOne({ title: title })
            if (checkTitle) {
                return res.status(400).send({
                    status: false,
                    message: "this title name already present in the DB, please change the title name"
                })
            }
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
                    message: "price should be in number format and can't be a any white spaces"
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
            if (currencyFormat !== "₹" || currencyFormat === "undefined") {
                return res.status(400).send({
                    status: false,
                    msg: "you have to put only one currencyFormat : ₹, or it is already present"
                })
            }
            obj["currencyFormat"] = currencyFormat.trim().split(" ").filter(x => x).join(" ")
        }

        //  Update productImage

        let files = req.files
        if (data.hasOwnProperty("productImage")) {
            if (!files || files.length == 0)
                return res.status(400).send({
                    status: false, message: "please insert product image"
                })
        }
        if (files.length != 0) {
            let productImage = await aws.uploadFile(files[0])
            obj["productImage"] = productImage
        }

        if (style) {
            if (style == "") {
                return res.status(400).send({
                    status: false,
                    message: "please put value in style"
                })
            }
            obj["style"] = style.trim().split(" ").filter(x => x).join(" ")
        }

        if (availableSizes) {
            availableSizes = availableSizes.split(",").map(x => x.trim().toUpperCase())
            if (availableSizes) {
                let enumArr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
                let uniqueSizes = [...new Set(availableSizes)]
                for (let i of uniqueSizes) {
                    if (enumArr.indexOf(i) == -1) {
                        return res.status(400).send({ status: false, message: `'${i}' is not a valid size, only these sizes are allowed [S, XS, M, X, L, XXL, XL]` })
                    }
                }
                obj.availableSizes = uniqueSizes
            }
        }

        if (installments != undefined && installments == "") {
            return res.status(400).send({
                status: false,
                message: "please put Number value in installments"
            })
        }

        if (data.installments) {
            if (isNaN(installments)) {
                return res.status(400).send({
                    status: false,
                    message: "please put Number not charactor"
                })
            }
            obj["installments"] = installments.trim().split(" ").filter(x => x).join(" ")
        }

        const updatedProduct = await productModel.findByIdAndUpdate({ _id: productId, isDeleted: false }, obj, { new: true })
        if (!updatedProduct) {
            return res.status(404).send({
                status: false,
                message: "product is already deleted or not found",
                data: updatedProduct
            })
        }

        return res.status(200).send({
            status: true,
            message: "Success",
            data: updatedProduct
        })

    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
}


/************End Update Product ById Function **************/


/************Start's Delete Product ById Function **************/

const deletProductById = async function (req, res) {

    try {

        const productId = req.params.productId;

        if (!valid.isValidObjectId(productId)) {
            return res.status(400).send({
                status: false,
                message: "productId not valid"
            })
        }

        let findProduct = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: new Date() } })  //{ new: true 

        if (!findProduct) {
            return res.status(404).send({
                status: false,
                message: "product is already deleted or not found with this Id"
            })
        }

        return res.status(200).send({ status: true, message: " successfully deleted" })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
}

/************Start's Delete Product ById Function **************/

module.exports = { createProduct, getProduct, getproductbyId, updateProductById, deletProductById }