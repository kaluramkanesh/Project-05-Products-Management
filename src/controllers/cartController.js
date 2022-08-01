const cartModel = require("../Models/cartModel")
const userModel = require("../Models/userModel")
const valid = require("../validations/validation")
const jwt = require("jsonwebtoken")
const productModel = require("../Models/productModel")

const createCart = async function (req, res) {
    try {
        let data = req.body
        let userIdParams = req.params.userId

        let { userId, items, totalPrice, totalItems } = data
         
        if (!(userIdParams == userId)) {
            return res.status(400).send({ status: false, message: "params's userId and body's userId are not matched " })
        }
               
        if (Object.keys(data).length === 0) {
            return res.status(400).send({
                status: false,
                message: "Body should  be not Empty please enter some data to create cart"
            })
        }

        if (!valid.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is not valid please provid valid UserId" })
        }


        if (!items) {
            return res.status(400).send({status:false , message:" items is required"})
        }

        if(items.productId){
        return res.status(400).send({status:false , message:"productId is required"})
        }

        if (!totalPrice){
            return res.status(400).send({status:false , message:" totalPrice is required"})
        }

        if(!totalItems){
            return res.status(400).send({status:false , message: " totalitems is required"})
        }

        let userData = await cartModel.findOne({ userId: userId })
        console.log(userData)

        if (userData) {
            return res.status(400).send({ status: false, message: "with this userId cart has already created" })
        }

        let createData = await cartModel.create(data)
        return res.status(201).send({ status: true, message: "cart created successfully", data: createData })

    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
}




module.exports = { createCart }
