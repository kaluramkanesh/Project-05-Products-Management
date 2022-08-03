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

        if (!valid.removeProduct(removeProduct) && removeProduct !== 1) { return res.status(400).send({ status: false, msg: "removeProduct field is required remove product will containt only 0 or 1 or " }) }


        if (removeProduct != 0 && removeProduct != 1) { return res.status(400).send({ status: false, msg: "remove product will containt only 0 or 1" }) }

        //  if (!removeProduct) { return res.status(400).send({ status: false, msg: "removeProduct field is required" }) }


        if (!valid.isValidObjectId(cartId)) { return res.status(400).send({ status: false, msg: "Please provide valid cart Id" }) }

        if (!valid.isValidObjectId(productId)) { return res.status(400).send({ status: false, msg: "Please provide valid Product Id" }) }

        let cartData = await cartModel.findOne({ $or: [{ _id: cartId }, { userId: userId }] })

        // console.log(cartData.items[0].productId.toString())
        if (cartData.items.length == 0) { return res.status(400).send({ status: false, msg: "There is no present  product id in cart model " }) }

        // if (!(cartData.items[0].productId.toString() == productId)) { return res.status(404).send({ status: false, msg: "Product Id is not found in cart model" }) }

        if (!cartData) { return res.status(400).send({ status: false, msg: "Cart does not axist" }) }

        if (cartData.items.length == 0) { return res.status(400).send({ status: false, msg: "Product No Found" }) }

        let productData = await productModel.findOne({ _id: productId, isDeleted: false })

        console.log(productData.price)

        if (!productData) { return res.status(404).send({ status: false, msg: "Product no found with product Id" }) }

        let items = cartData.items
        if (removeProduct == 0) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].productId == productId) {
                    cartData.totalPrice = cartData.totalPrice - productData.price * items[i].quantity
                    items.splice(i, 1)
                    cartData.totalItems = cartData.totalItems - 1

                }
            }
            cartData.save()
            return res.status(200).send({ status: true, message: "success", data: cartData })
        } else {
            if (cartData.items.length == 0) {
                return res.status(400).send({
                    status: false,
                    msg: "this item you trying to remove is does't exist in your cart"
                })
            }
            for (let i = 0; i < items.length; i++) {
                if (items[i].productId == productId) {
                    cartData.totalPrice = cartData.totalPrice - productData.price
                    let quantity = items[i].quantity
                    quantity = quantity - 1
                    items[i].quantity = quantity
                    if (items[i].quantity == 0) {
                        items.splice(i, 1)
                        cartData.totalItems = cartData.totalItems - 1
                    }
                }
            }

            cartData.save()
            return res.status(200).send({ status: true, message: "success", data: cartData })

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

module.exports = { createCart, updateCart, deleteCartBYId }
