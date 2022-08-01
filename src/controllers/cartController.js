const cartModel = require("../Models/cartModel")
const userModel = require("../Models/userModel")
const valid = require("../validations/validation")

const createCart = async function (req, res) {
    try {
        let data = req.body
        let userIdParams = req.params.userId

        let { userId, items, quantity, totalPrice, totalItems } = data
        if (userIdParams != userId) {
            return res.status(400).send({ status: false, message: "params's userId and body's userId are not matched " })
        }

        if (Object.keys(data).length === 0) {
            return res.status(400).send({
                status: false,
                message: "Body should  be not Empty please enter some data to create cart"
            })
        }

        if (!valid.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is not valid please provid valid UserId" })
        }
         
        if(!items)
        {
            return res
        }
        let userData = await cartModel.findOne({ userId: userId })
        console.log(userData)

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
  

module.exports = {createCart }