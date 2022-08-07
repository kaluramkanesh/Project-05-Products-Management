const cartModel = require("../Models/cartModel")
const valid = require("../validations/validation")
const userModel = require("../Models/userModel")
const productModel = require("../Models/productModel")

/***********************************[ start Create Cart Function ]***************************************/

const createCart = async function (req, res) {
    try {
        let data = req.body
        const userIdParams = req.params.userId
        let checkUserId = await userModel.findOne({_id : userIdParams })
        if(!checkUserId){
            return res.status(404).send({ status: false, message: "userId not found in DB" })
        }

        let { cartId, productId } = data

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
            return res.status(400).send({
                status: false,
                message: "userId from params is not valid, please provid valid UserId"
            })
        }

        if (!valid.isValidObjectId(productId)) {
            return res.status(400).send({
                status: false,
                message: "invalid ProductId"
            })
        }

        let cartData = await cartModel.findOne({ userId: userIdParams })

        let productCall = await productModel.findOne({ _id: productId })

        if (productCall.isDeleted == true) {
            return res.status(400).send({
                status: false,
                message: "this product Id is deleted in DB"
            })
        }

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
                message: "cart created successfully",
                data: cartCreated
            })
        }

        if (cartData) {

            if (!cartId) {
                return res.status(400).send({
                    status: false,
                    message: "cart id is required"
                })
            }
            if (!valid.isValidObjectId(cartId)) {
                return res.status(400).send({
                    status: false,
                    message: "cartId is invalid "
                })
            }

            if (!productId) {
                return res.status(400).send({
                    status: false,
                    message: "for adding any product, please give productId"
                })
            }

            if (cartId != cartData._id) {
                return res.status(404).send({
                    status: false,
                    message: "cartId not found in cartModel"
                })
            }

            let item = cartData.items

            for (let i = 0; i < item.length; i++) {
                if (item[i].productId == productId) {
                    item[i].quantity += 1

                    let quantityAdd = await cartModel.findOneAndUpdate({ userId: userIdParams, }, { items: item, totalPrice: cartData.totalPrice + productCall.price }, { new: true })
                    return res.status(200).send({
                        status: true,
                        message: " quantity successfully added",
                        data: quantityAdd
                    })
                }
            }
            let variable = {
                $addToSet: { items: { productId: productId, quantity: 1 } },           // Adds an object to an array if it does not exists
                totalPrice: cartData.totalPrice + productCall.price,
                totalItems: cartData.totalItems + 1
            }

            let cartUpdate = await cartModel.findOneAndUpdate({ userId: userIdParams }, variable, { new: true }).select({ "items._id": 0 })

            return res.status(200).send({
                status: true,
                message: "successfully product added",
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



/***********************************start get Cart Function***************************************/


const getCartById = async function (req, res) {

    try {

        const userId = req.params.userId
        if(!valid.isValidObjectId(userId)){
            return res.status(400).send({ status: false, message: "invalid userId" })

        }
        let cart = await cartModel.findOne({ userId: userId })
        if(!cart){
            return res.status(404).send({ status: false, message: "userId not found in DB" })

        }

        if (cart.userId != userId) {
            return res.status(400).send({ status: false, message: "with this userId cart does not exist" })
        }

        let createCart = await cartModel.findByIdAndUpdate(cart._id, { new: true }).select({ "items._id": 0 }).populate("items.productId", { title: 1, _id: 1, price: 1, productImage: 1, availableSizes: 1 })
        return res.status(200).send({ status: true, message: "Product SuccessFully Added", data: createCart })

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
/***********************************[ End Get Cart Function ]***************************************/



/***********************************[ start Update Cart Function ]***************************************/

const updateCart = async function (req, res) {
    try {
        let data = req.body

        const userId = req.params.userId
        if(!valid.isValidObjectId(userId)){
            return res.status(400).send({ status: false, message: "invalid userId" })
        }

        let { cartId, productId, removeProduct } = data

        if (!cartId) {
            return res.status(400).send({
                status: false,
                msg: "Cart Id field is required"
            })
        }

        if (!productId) {
            return res.status(400).send({
                status: false,
                msg: "Product Id field is required"
            })
        }

        if (!valid.isValidObjectId(cartId)) {
            return res.status(400).send({
                status: false,
                msg: "Please provide valid cart Id"
            })
        }

        if (!valid.isValidObjectId(productId)) {
            return res.status(400).send({
                status: false, msg: "Please provide valid Product Id"
            })
        }

        let cartData = await cartModel.findOne({ $or: [{ _id: cartId }, { userId: userId }] })

        if (cartData.items.length == 0) {
            return res.status(400).send({
                status: false,
                msg: "this item you trying to remove is does't exist in your cart"
            })
        }

        if (!cartData) {
            return res.status(400).send({
                status: false,
                msg: "Cart does not axist"
            })
        }

        let productData = await productModel.findOne({ _id: productId })

        if (!productData) {
            return res.status(404).send({
                status: false,
                message: "Product not found with this product Id"
            })
        }

        if (productData.isDeleted == true) {
            return res.status(400).send({
                status: false,
                message: "this product Id is deleted in DB"
            })
        }

        if (!valid.removeProduct(removeProduct) && removeProduct !== 1) {
            return res.status(400).send({
                status: false,
                msg: "removeProduct field is required remove product will containt only 0 or 1 or "
            })
        }

        let items = cartData.items

        if (removeProduct == 0) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].productId == productId) {

                    items.splice(i, 1)

                    cartData.totalPrice = cartData.totalPrice - productData.price * items[i].quantity

                    cartData.totalItems = cartData.totalItems - 1
                }
            }
            cartData.save() //  the save() method replaces the existing document with the document passed in save() method.
            return res.status(200).send({
                status: true,
                message: "success",
                data: cartData
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
            cartData.save() //  the save() method replaces the existing document with the document passed in save() method.
            return res.status(200).send({
                status: true,
                message: "success",
                data: cartData
            })
        }
    }
    catch (err) {
        return res.status(500).send({
            status: false,
            error: err.message
        })
    }
}

/***********************************[ End Update Cart Function ]***************************************/


//====================================  cart Deleted ================================
const deleteCartBYId = async function (req, res) {

    try {
        const userId = req.params.userId

        if (!valid.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId" });
        }

        const existCart = await cartModel.findOne({ userId: userId })
        if (!existCart) {
            return res.status(404).send({ status: false, message: "No data found" });
        }

        const updateCartDetails = await cartModel.findOneAndUpdate({ userId: existCart.userId }, { items: [], totalItems: 0, totalPrice: 0 }, { new: true })


        return res.status(204).send({ status: true, message: 'sucessfully deleted', data: updateCartDetails })


    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}


module.exports = { createCart, getCartById, updateCart, deleteCartBYId }
