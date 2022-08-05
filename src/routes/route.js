const express = require("express")
const userController = require("../controllers/userController")
const productController = require("../controllers/productController")
const cartController = require("../controllers/cartController")
const orderController=require("../controllers/orderController")
const Router = express.Router()
const mid = require("../Middleware/Auth")


/*-----------------------------User Register----------------------------*/
Router.post("/register", userController.createUsers)

/*-----------------------------User Login----------------------------*/
Router.post("/login", userController.userLogin);

/*------------------------Get User Api's---------------------------------*/
Router.get("/user/:userId/profile", mid.jwtValidation, userController.getUserById)

/*------------------------Update User Api's---------------------------------*/
Router.put("/user/:userId/profile",mid.jwtValidation, userController.updateUser)



//------ Create Product-------------------------------------------
Router.post("/products" ,productController.createProduct)

// Router.get("/products",productController.getProductByQuery)

//------ Get Product-------------------------------------------
Router.get("/products" ,productController.getProduct)

//------ Get Product By Id-------------------------------------------
Router.get("/products/:productId" ,productController.getproductbyId)

//------ Update Product By Id-------------------------------------------
Router.put("/products/:productId" ,productController.updateProductById)

//------ Delete Product By Id-------------------------------------------
Router.delete("/products/:productId" ,productController.deletProductById)



/*--------------------------Update Cart Api's-------------------------*/
Router.put("/users/:userId/cart",mid.jwtValidation,cartController.updateCart)
//*******************cartController */

//------ Create Cart-------------------------------------------
Router.post("/users/:userId/cart",mid.jwtValidation, cartController.createCart)

//------ Delete cart By Id-------------------------------------------
Router.delete("/users/:userId/cart",cartController.deleteCartBYId)

Router.put("/users/:userId/orders",orderController.updateOrder)



//************ checking your end point valid or not */
Router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        message: "Make Sure Your Endpoint is Correct or Not!"
    })
})

module.exports = Router


