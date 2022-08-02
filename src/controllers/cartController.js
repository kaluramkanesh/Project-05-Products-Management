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
                items: [{ productId : productId, quantity : 1 }],
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

        if(cartData){
            if(!cartId){
                return res.status(400).send({message: " cart id is requires"})
            }

            if(cartId != cartData._id){
                return res.status(404).send({message: "cart not found"})
            }

            let item = cartData.items

            for(let i= 0; i<item.length; i++){
                if(item[i].productId == productId){
                    item[i].quantity += 1

                    let quantityAdd = await cartModel.findOneAndUpdate({
                        userId : userIdParams, 
                    }, { items : item , totalPrice: cartData.totalPrice + productCall.price },{new: true} )

                    return res.status(201).send({
                        status: true,
                        message: " success cart added",
                        data : quantityAdd
                    })
                }
            }
             let variable = {
                $addToSet : {items: {productId: productId, quantity:1}},
                totalPrice: cartData.totalPrice + productCall.price,
                totalItems: cartData.totalItems + 1
             }

             let cartUpdate = await cartModel.findOneAndUpdate({
                userId : userIdParams, 
            }, variable ,{new: true} )

            return res.status(201).send({
                message: " success cart added",
                data : cartUpdate
            })
        }






        




        // let { productId, quantity } = data

        // let obj = {}

        // let productCall = await productModel.findOne({ _id: productId, isDeleted: false })

        // console.log(productCall._id, productCall.price)

        // obj._id = cartData._id

        // obj.userId = userIdParams

        // let items = []
        // let itemsObj = {}


        // if (!productId) {
        //     return res.status(400).send({
        //         status: false,
        //         message: "if u add any product, please give productId in the body"
        //     })
        // }

        // if (!valid.isValidObjectId(productId)) {
        //     return res.status(400).send({
        //         status: false,
        //         message: "invalid productId"
        //     })
        // }

        // itemsObj.productId = productId
        // itemsObj.quantity = quantity

        // items.push(itemsObj)

        // obj.items = items

        // let totalPrice = productCall.price
        // let totalItems = "2"

        // obj.totalPrice = totalPrice

        // obj.totalItems = totalItems

        // console.log(obj)











        // if(productId){
        //   let product_id = await userModel.findById({_id: userId})
        //   console.log(product_id)
        // }

        // if (!totalPrice){
        //     return res.status(400).send({status:false , message:" totalPrice is required"})
        // }

        // if(!totalItems){
        //     return res.status(400).send({status:false , message: " totalitems is required"})
        // }




        // let createData = await cartModel.create(data)
        // return res.status(201).send({ status: true, message: "cart created successfully", data: createData })

    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
}

// cartModel.findById(cartId).populate([{ path: "items.productId" }])


//====================================  cart Deleted ================================
// const deleteCartBYId = async function (req, res) {

//     try { 
//       let userId = req.params.userId

//       if (!valid.isValidObjectId(userId)) {
//         return res.status(400).send({ status: false, message: "Invalid userId" });
//       }
//       const existCart = await cartModel.findOne({ _id: book, });

//       if (!existBook) {
//         return res.status(404).send({status: false,message: "No data found"});}


//       let checkUser = await userModel.findOne({ _id: userId, isDeleted: false })

//       if (!checkUser) {
//           return res.status(404).send({ status: false, message: 'user not found or already deleted' })
//         }
//         console.log(checkUser,"1")

//     const delcart = await cartModel.findByIdAndUpdate({ _id: checkUser._id }, { $set: { isDeleted: true } });
//     console.log(delcart,"2")

//     if (delcart) {
//       const updateCartDetails = await cartModel.findOneAndUpdate(
//         { _id: delcart.userId, isDeleted: false },{ $inc: { totalItems: -1, totalPrice: -1 } },{ new: true }
//         );
//         console.log(updateCartDetails,"3")

//        let updateCart = await cartModel.findOneAndUpdate({ _id: userId }, { isDeleted: true, deletedAt:new Date() }, { new: true })

//       res.status(200).send({ status: true, message: 'sucessfully deleted', data:updateCartDetails })

//     }
//  } catch (error) {
//       res.status(500).send({ status: false, error: error.message });
//     }
//   }


module.exports = { createCart }
