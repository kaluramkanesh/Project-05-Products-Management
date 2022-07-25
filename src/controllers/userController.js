const userModel = require("../Models/userModel")
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")


//******************user login***********

const userLogin = async function (req, res) {
    try {
        let value = req.body
        let userId = value.email
        console.log(userId)

        let password = value.password


        // *******empty attribute******

        // if (!isValid(userId) || !isValid(password)) return res.status(400).send({ status: false, msg: "Pls Provide  Email And Password both" })

        let user = await userModel.findOne({ $and: [{ email: userId, password: password }] })
        console.log(user)
        if (!user) return res.status(400).send({ status: false, msg: "The email or password you are using is wrong" })

        let token = jwt.sign({
            userId: user._id.toString(),
            iat: new Date().getTime(),
            exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60
        }, "project-5",
        
     )
     console.log(token)
        return res.status(200).send({status: true , msg : "succesfully created" , data: token })
    }

    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports.userLogin = userLogin