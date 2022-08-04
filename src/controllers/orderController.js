const orderModel = require('../models/orderModel')
const cartModel = require('../models/cartModels')
const userModel = require('../models/userModel')
const valid = require('../validations/validation')

const createOrder = async function (req, res) {
try{







}
catch (error) {
    return res.status(500).send({
        status: false,
        message: error.message
    })
}
}