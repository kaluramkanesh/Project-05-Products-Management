const express = require("express")
const userController = require("../controllers/userController")
const Router = express.Router()
const mid = require("../Middleware/Auth")



Router.post("/register",userController.createUsers)

// *************user login******
Router.post("/login",userController.userLogin);

Router.get("/user/:userId/profile", mid.authUserById, userController.getUserById)

module.exports = Router


