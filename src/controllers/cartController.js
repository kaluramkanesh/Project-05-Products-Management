const cartModel = require("../Models/cartModel")
const userModel = require("../Models/userModel")
const valid = require("../validations/validation")
const productModel = require("../Models/productModel")


/***********************************End Update Cart Function***************************************/

const updateCart = async function (req, res) {
    try {
        let data = req.body

        let userId = req.params.userId

        let { cartId, productId, removeProduct } = data

        if (!cartId) { return res.status(400).send({ status: false, msg: "Cart Id field is required" }) }

        if (!productId) { return res.status(400).send({ status: false, msg: "Product Id field is required" }) }

        if (!removeProduct) { return res.status(400).send({ status: false, msg: "removeProduct field is required" }) }

        if (!valid.isValidObjectId(cartId)) { return res.status(400).send({ status: false, msg: "Please provide valid cart Id" }) }

        if (!valid.isValidObjectId(productId)) { return res.status(400).send({ status: false, msg: "Please provide valid Product Id" }) }

        let cartData = await cartModel.findOne({ _id: cartId, userId: userId })

        if (!cartData) { return res.status(400).send({ status: false, msg: "Cart does not axist" }) }

        if (cartData.items.length == 0) { return res.status(400).send({ status: false, msg: "Product No Found" }) }

        let productData = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!productData) { return res.status(404).send({ status: false, msg: "Product no found with product Id" }) }

        let price = productData.price

        let quantity = cartData.items.filter(x => x.productId.toString() === productId[0].quantity)

        
        if (removeProduct != 0 && removeProduct != 1) { return res.status(400).send({ status: false, msg: "remove product will cantaint only 0 or 1" }) }

        if (removeProduct == 0) {

            let deleteProductData = await cartModel.findByIdAndUpdate({ "items.productId": productId, _id: cartId }, { $pull: { items: { productId: productId } }, $inc: { totalPrice: -price * quantity, totalItems: -1 } }, { new: true })

            return res.status(200).send({ status: true, message: "Cart Data updated successfully", data: deleteProductData })
        }
        if (removeProduct == 1) {

            if (quantity > 1) {

                let reduceProduct = await cartModel.findOneAndUpdate({ "items.productId": productId, cartId: cartId },
                    { $inc: { "items.$.quantity": -1, totalPrice: -price } }, { new: true })

                return res.status(200).send({ status: true, messsage: "product removed successfully", data: reduceProduct })
            }
            else {
                const deleteProduct = await cartModel.findOneAndUpdate({ "items.productId": productId, cartId: cartId },
                    { $pull: { items: { productId: productId } }, $inc: { totalItems: -1, totalPrice: -price } }, { new: true })

                return res.status(200).send({ status: true, messsage: "item removed successfully", data: deleteProduct })
            }
        } 

    }
    catch (Err) {
        console.log(Err)
        res.status(500).send({ status: false, message: Err.message })
    }
}

/***********************************End Update Cart Function***************************************/
module.exports = {updateCart }
