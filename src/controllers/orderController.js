const orderModel = require('../Models/orderModel')
const cartModel = require('../Models/cartModel')
const userModel = require('../Models/userModel')
const valid = require('../validations/validation')

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

module.exports = { createOrder }