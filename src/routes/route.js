const express = require("express")
// const mongoose=require("mongoose")
const userController = require("../controllers/userController")

const Router = express.Router()

Router.get("/testMe", function (req, res) {
    res.status(200).send({ status: true, msg: "Done" })
})

Router.post("/register",userController.createBooks)

module.exports = Router