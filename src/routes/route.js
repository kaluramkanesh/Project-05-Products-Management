const express = require("express")
const userController = require("../controllers/userController")
// const mongoose=require("mongoose")

const Router = express.Router()

Router.get("/testMe", function (req, res) {
    res.status(200).send({ status: true, msg: "Done" })
})

Router.post("/register",userController.createUsers)

module.exports = Router