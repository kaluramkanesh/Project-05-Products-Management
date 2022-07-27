const productModel = require("../Models/productModel")
const valid = require("../validations/validation")


//*********************** GET /products  */


const getProduct = async function (res , req){
    try{

        let data = req.body
        let { title, description, price, 
            currencyId, currencyFormat, isFreeShipping, 
            productImage, style, availableSizes, 
            installments, deletedAt, isDeleted, createdAt, updatedAt } = data

    }
    catch(err){
        return res.status(500).send({
            ststus: false,
            error: err.message
        })
    }
}