const cartModel = require ("../Models/cartModel")
const valid = require ("../validations/validation")
const jwt = require ("jsonwebtoken")

const createCart = async function (req,res){

   try{
         let data= req.body
         let

    } catch {


    }
}




// ## Cart APIs (_authentication required as authorization header - bearer token_)
// ### POST /users/:userId/cart (Add to cart)
// - Create a cart for the user if it does not exist. Else add product(s) in cart.
// - Get cart id in request body.
// - Get productId in request body.
// - Make sure that cart exist.
// - Add a product(s) for a user in the cart.
// - Make sure the userId in params and in JWT token match.
// - Make sure the user exist
// - Make sure the product(s) are valid and not deleted.
// - Get product(s) details in response body.





module.exports={ createCart}
