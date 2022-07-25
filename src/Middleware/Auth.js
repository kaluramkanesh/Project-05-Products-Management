const jwt = require("jsonwebtoken")
const cartModel = require("../Models/cartModel")
const orderModel = require("../Models/ordertModel")
const productModel = require("../Models/productModel")
const userModel = require("../Models/userModel")

const jwtvalidation = function (req, res) {
    try {
        let token = req.headers["x-Api-Key"];
        if (!token) token = req.headers["x-api-key"];

        if (!token) return res.status(400).send({ 
            status: false, 
            msg: "token must be present" 
        });

        jwt.verify(token, "project-5", (err, decoded) => {
            //Only if token validation Fails
            if (err) {
                return res.status(401).send({
                    status: false,
                    msg: "Authentication Failed"
                })
            }//If token validaion Passes
            else {
                //Attribute to store the value of decoded token 
                req.token = decoded
                next()
            }
        })
    }
    catch (err) {
        return res.status(500).send({
            message: err.message
        })
    }
}