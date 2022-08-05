const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const userModel = require("../Models/userModel")
const validator = require("../validations/validation")


//****************authentication*********/

const jwtValidation = async function (req, res, next) {
    try {

        let token = req.headers["authorization"]

        if (!token) {
            return res.status(400).send({
                status: false,
                message: "token is not present"
            })
        }
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length)
        }
        if (token) {
            jwt.verify(token, "project-5", (err, decoded) => {
                if (err) {
                    return res.status(401).send({
                        status: false,
                        message: "Authentication Failed"
                    })
                }
                else {
                    req.token = decoded
                    next()
                }
            })
        }
    }
    catch (err) {
        return res.status(500).send({
            status: false,
            message: err.message
        })
    }
}

//******************authorization */

const authorization = async function (req, res, next) {
    try {

        let userLoggedIn = req.token.userId
        let userId = req.params.userId

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({
                status: false,
                message: "params's userId is invalid "
            })
        }

        if (userLoggedIn != userId) {
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



module.exports.jwtValidation = jwtValidation
module.exports.authorization = authorization
