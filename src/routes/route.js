const express = require("express")
const userController = require("../controllers/userController")
const Router = express.Router()
const mid = require("../Middleware/Auth")


//**************create User */
Router.post("/register",userController.createUsers)

// *************user login */
Router.post("/login",userController.userLogin);

//*************get User */
Router.get("/user/:userId/profile", mid.jwtValidation, userController.getUserById)



//************ checking your end point valid or not */
Router.all("/****", function (req, res) {
    res.status(404).send({
        status: false,
        message: "Make Sure Your Endpoint is Correct or Not!"
    })
})

module.exports = Router


