const express = require("express")
// const mongoose=require("mongoose")

const Router = express.Router()

Router.get("/testMe", function (req, res) {
    res.status(200).send({ status: true, msg: "Done" })
})

Router.post("/")

module.exports = Router