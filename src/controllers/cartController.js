const cartModel = require("../Models/cartModel")
const userModel = require("../Models/userModel")
const valid = require("../validations/validation")
const productModel = require("../Models/productModel")

const createCart = async function (req, res) {
    try {
        let data = req.body
        let userIdParams = req.params.userId

        let { cartId, productId } = data

        // if (!valid.isValidObjectId(cartId)) {
        //     return res.status(400).send({ status: false, message: "cartId is invalid " })
        // }

        if (!productId || !valid.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Enter valid ProductId" })
        }

        if (Object.keys(data).length == 0) {
            return res.status(400).send({
                status: false,
                message: "Body should be not Empty please enter some data to create cart"
            })
        }

        if (!valid.isValidObjectId(userIdParams)) {
            return res.status(400).send({ status: false, message: "userId is not valid please provid valid UserId" })
        }

        let cartData = await cartModel.findOne({ userId: userIdParams })

        let productCall = await productModel.findOne({ _id: productId, isDeleted: false })


        if (!cartData) {

            let cartDataAdd = {
                userId: userIdParams,
                items: [{ productId: productId, quantity: 1 }],
                totalPrice: productCall.price,
                totalItems: 1
            }

            let cartCreated = await cartModel.create(cartDataAdd)
            return res.status(201).send({
                status: true,
                message: " cart created",
                data: cartCreated
            })
        }

        if (cartData) {
            if (!cartId) {
                return res.status(400).send({ message: " cart id is requires" })
            }

            if (cartId != cartData._id) {
                return res.status(404).send({ message: "cart not found" })
            }

            let item = cartData.items

            for (let i = 0; i < item.length; i++) {
                if (item[i].productId == productId) {
                    item[i].quantity += 1

                    let quantityAdd = await cartModel.findOneAndUpdate({
                        userId: userIdParams,
                    }, { items: item, totalPrice: cartData.totalPrice + productCall.price }, { new: true })

                    return res.status(201).send({
                        status: true,
                        message: " success cart added",
                        data: quantityAdd
                    })
                }
            }
            let variable = {
                $addToSet: { items: { productId: productId, quantity: 1 } },
                totalPrice: cartData.totalPrice + productCall.price,
                totalItems: cartData.totalItems + 1
            }

            let cartUpdate = await cartModel.findOneAndUpdate({
                userId: userIdParams,
            }, variable, { new: true })

            return res.status(201).send({
                message: " success cart added",
                data: cartUpdate
            })
        }
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
}

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


//====================================  cart Deleted ================================
const deleteCartBYId = async function (req, res) {

    try {
        let userId = req.params.userId

        if (!valid.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId" });
        }
        const existCart = await cartModel.findOne({ userId: userId })


        if (!existCart) {
            return res.status(404).send({ status: false, message: "No data found" });
        }
        console.log(existCart.totalPrice, existCart.totalItems)


        const updateCartDetails = await cartModel.findOneAndUpdate(
            { userId: existCart.userId }, { $set: { "items": [], totalItems: 0, totalPrice: 0 } }, { new: true })

        console.log(updateCartDetails, "3")

        res.status(204).send({ status: true, message: 'sucessfully deleted', data: updateCartDetails })


    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}


module.exports = { createCart,updateCart, deleteCartBYId }
