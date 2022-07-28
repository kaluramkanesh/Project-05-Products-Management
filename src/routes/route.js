const express = require("express")
const userController = require("../controllers/userController")
const productController = require("../controllers/productController")
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


Router.post("/products" ,productController.createProduct)

Router.get("/products", productController.getProduct)



//************ checking your end point valid or not */
Router.all("/****", function (req, res) {
    res.status(404).send({
        status: false,
        message: "Make Sure Your Endpoint is Correct or Not!"
    })
})

module.exports = Router


