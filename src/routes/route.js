const express = require("express")
// const mongoose=require("mongoose")
const Router = express.Router()
const userController = require("../controllers/userController")
// Router.get("/testMe", function (req, res) {
//     res.status(200).send({ status: true, msg: "Done" })
// })



// *************user login******
Router.post("/login",userController.userLogin);

module.exports = Router


