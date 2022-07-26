const express = require("express")
const userController = require("../controllers/userController")
const Router = express.Router()


Router.post("/register", userController.createUsers)

/*-----------------------------User Login----------------------------*/
Router.post("/login", userController.userLogin);

/*------------------------Update User Api's---------------------------------*/
Router.put("/user/:userId/profile", userController.updateUser)


/*-------------------When no Api will run that time this Api will run----------------- */
Router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        msg: "The api you request is not available"
    })
})

module.exports = Router


