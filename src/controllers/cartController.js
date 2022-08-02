const cartModel = require("../Models/cartModel")
const userModel = require("../Models/userModel")
const valid = require("../validations/validation")
const productModel = require("../Models/productModel")

const createCart = async function (req, res) {
    try {
        let data = req.body
        let userIdParams = req.params.userId

        let { cartId, productId, quantity } = data
         
        // if (cartId && !valid.isValidObjectId(cartId)) {
        //     return res.status(400).send({ status: false, message: "params's userId and body's userId are not matched " })
        // }

        if (!productId || !valid.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Enter valid ProductId" })
        }
               
        let cart = await cartModel.findOne({userId :userIdParams})
        console.log(cart)
        if (Object.keys(data).length == 0) {
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
        let { quntity } = items
        if(productId){
          let product_id = await userModel.findById({_id: userId})
          console.log(product_id)
        }

        if (!totalPrice){
            return res.status(400).send({status:false , message:" totalPrice is required"})
        }

        if(!totalItems){
            return res.status(400).send({status:false , message: " totalitems is required"})
        }


        let userData = await cartModel.findOne({ userId: userId })
        // console.log(userData)

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


//====================================  cart Deleted ================================
const deleteCartBYId = async function (req, res) {

    try { 
      let userId = req.params.userId
  
      if (!valid.isValidObjectId(userId)) {
        return res.status(400).send({ status: false, message: "Invalid userId" });
      }
      const existCart = await cartModel.findOne({ userId: userId })
    

      if (!existCart) {
        return res.status(404).send({status: false,message: "No data found"});
    }
    console.log(existCart.totalPrice, existCart.totalItems)

   
      const updateCartDetails = await cartModel.findOneAndUpdate(
        { userId: existCart.userId },{$set: { "items": [] ,totalItems: 0, totalPrice: 0}} ,{ new: true })
        
        console.log(updateCartDetails,"3")
  
      res.status(204).send({ status: true, message: 'sucessfully deleted', data: updateCartDetails})
  
    
 } catch (error) {
      res.status(500).send({ status: false, error: error.message });
    }
  }
  

module.exports = {createCart, deleteCartBYId }
