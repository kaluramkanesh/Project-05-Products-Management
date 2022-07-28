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



//------ create product-------------------------------------------
Router.post("/products" ,productController.createProduct)

//------ get product-------------------------------------------
Router.get("/products" ,productController.getProduct)

//------ get product by Id-------------------------------------------
Router.get("/products/:productId" ,productController.getproductbyId)

//------ update product by Id-------------------------------------------
Router.put("/products/:productId" ,productController.updateProductById)

//------ delete product by Id-------------------------------------------
// Router.delete("/products/:productId" ,productController.deletProductById)



//************ checking your end point valid or not */
Router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        message: "Make Sure Your Endpoint is Correct or Not!"
    })
})

module.exports = Router


