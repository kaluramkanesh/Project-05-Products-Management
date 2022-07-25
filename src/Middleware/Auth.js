const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const cartModel = require("../Models/cartModel")
const orderModel = require("../Models/ordertModel")
const productModel = require("../Models/productModel")
const userModel = require("../Models/userModel")


//****************authentication*********/

const jwtValidation = function (req, res) {
    try {
        let token = req.headers.Authorization["Bearer Token"];

        if (!token) return res.status(400).send({
            status: false,
            msg: "token must be present"
        });

        jwt.verify(token, "project-5", (err) => {
            if (err) {
                return res.status(401).send({
                    status: false,
                    msg: "Authentication Failed"
                })
            }
        })
    }
    catch (err) {
        return res.status(500).send({
            message: err.message
        })
    }
}


//****************************authorization**************/


const authUserById = async function (req, res) {
    try {

        let token = req.Authorization["Bearer Token"]
        let decodedToken = jwt.verify(token, "project-5")

        let userId = req.params.userId

        if (!validator.isVlidObjectId(userId)) {
            return res.status(400).send({
                status: false,
                message: "userId is invalid"
            })
        }

        let matchUser = await userModel.findById(userId)
        if (!matchUser) {
            return res.status(404).send({
                status: false,
                message: "user doesn't exist"
            })
        }
        if (decodedToken.userId !== matchUser.userId.toString()) {
            return res.status(403).send({
                status: false,
                message: "authorization failed"
            });
        }
        next();
    }
    catch (err) {
        return res.status(500).send({
            status: false,
            message: err.message
        })
    }
}


module.exports.jwtValidation= jwtValidation
module.exports.authUserById= authUserById