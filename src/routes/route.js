const express = require("express")
const userController = require("../controllers/userController")
const Router = express.Router()



Router.post("/register",userController.createUsers)

// *************user login******
Router.post("/login",userController.userLogin);

module.exports = Router


