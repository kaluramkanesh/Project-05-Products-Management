const orderModel = require("../Models/orderSchema")
const cartModel = require("../Models/cartModel")
const userModel = require("../Models/userModel")
const valid = require("../validations/validation")

// const orderModel = require('../Models/orderModel')
// const cartModel = require('../Models/cartModel')
// const userModel = require('../Models/userModel')
// const valid = require('../validations/validation')

/*************************************Start's Create Order Api's Function******************************************/
const createOrder = async function (req, res) {
    try {
        let data = req.body
        let userId = req.params.userId

        const { cartId, cancellable } = data

        if (Object.keys(data).length == 0) {
            return res.status(400).send({
                status: false,
                message: "Body should be not Empty please enter some data to create order"
            })
        }

        if (!valid.isValidObjectId(cartId)) {
            return res.status(400).send({
                status: false,
                message: "Please provide a valid cartId"
            })
        }

        const cart = await cartModel.findOne({ userId: userId })

        if (!cart) {
            return res.status(404).send({
                status: false,
                Message: " user's cart unavailable"
            })
        }
        if (cart._id != cartId) {
            return res.status(400).send({
                status: false,
                Message: " Cart id doesn't belong to this user"
            })
        }

        let obj = { deletedAt: 0, isDeleted: 0 }

        obj["userId"] = userId
        obj["totalPrice"] = cart.totalPrice
        obj["totalItems"] = cart.totalItems

        let items = cart.items

        obj["items"] = cart.items
        let sum = 0
        let arr = []
        for (let i = 0; i < items.length; i++) {
            if (items[i].productId) {
                arr.push(sum += items[i].quantity)

            }

        }

        obj["totalQuantity"] = arr.pop()

        // let len = arr.length-1
        // let sl = arr.slice(len, len.length)
        // obj["totalQuantity"] = sl.join("")

        // console.log(sl.join(""))

        // let arr1 = arr.splice(-1,1).join("")
        //  obj["totalQuantity"] = arr1


        let orderCreated = await orderModel.create(obj)
        return res.status(201).send({
            status: true,
            message: "order created",
            data: orderCreated
        })


    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
}

/*************************************End Create Order Api's Function******************************************/


/*************************************Start's Update Order Api's Function******************************************/

const updateOrder = async function (req, res) {
    try {

        let userId = req.params.userId

        let data = req.body

        let { orderId, status } = data

        if (!orderId) { return res.status(400).send({ status: false, message: "Order Id is required field in params please give it" }) }

        if (!valid.isValidObjectId(orderId)) { return res.status(400).send({ status: false, message: "😢Invalid Order Id Please give correct order id " }) }


        if (!["pending", "completed", "canceled"].includes(status)) {
            return res.status(400).send({
                status: false,
                message: "Status should be only ['completed','canceled']"
            })
        }

        let dbOrder = await orderModel.findOne({ _id: orderId, userId: userId })
        if (!dbOrder) {
            return res.status(400).send({
                status: false,
                message: "order in not present"
            })
        }

        if (dbOrder.status == "completed") {
            return res.status(400).send({
                status: false,
                message: "order already completed"
            })
        }
        if (dbOrder.status == "canceled") {
            return res.status(400).send({
                status: false,
                message: "order already canceled"
            })
        }

        if (dbOrder.cancellable = false) {
            return res.status(400).send({
                status: false,
                message: "you can't cancelled this order"
            })
        }

        await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalItems: 0, totalPrice: 0 })

        let belongToUser = await orderModel.findOneAndUpdate({ _id: orderId, isDeleted: false },
            { status: status }, { new: true })

        return res.status(200).send({ status: false, message: belongToUser })

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, error: err.message })
    }
}

/*************************************End Update Order Api's Function******************************************/

module.exports = { createOrder, updateOrder }
