const orderModel = require("../Models/orderSchema")
const cartModel = require("../Models/cartModel")
const userModel = require("../Models/userModel")
const valid = require("../validations/validation")

 
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
    
            let dbOrder = await orderModel.findOne({_id:orderId, userId:userId})
            if(!dbOrder){
                return res.status(400).send({
                    status: false,
                    message: "order in not present"
                })
            }
    
            if(dbOrder.status == "completed"){
                return res.status(400).send({
                    status: false,
                    message: "order already completed"
                })
            }
            if(dbOrder.status == "canceled"){
                return res.status(400).send({
                    status: false,
                    message: "order already canceled"
                })
            }
    
            if(dbOrder.cancellable = false){
                return res.status(400).send({
                    status: false,
                    message: "you can't cancelled this order"
                })
            }
    
            await cartModel.findOneAndUpdate({ userId:userId }, {items : [],totalItems:0, totalPrice : 0})
    
            let belongToUser = await orderModel.findOneAndUpdate({ _id: orderId, isDeleted: false },
                { status: status }, { new: true })
                
            return res.status(200).send({ status: false, message: belongToUser })
    
        } catch (err) {
            console.log(err)
            res.status(500).send({ status: false, error: err.message })
        }
    }


module.exports = { updateOrder }