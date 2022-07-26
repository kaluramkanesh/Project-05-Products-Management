const userModel = require("../Models/userModel")
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const valid = require("../validations/validation")
const aws = require("aws-sdk")
const bcrypt = require("bcrypt")


aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  //HERE
            Key: "abc/" + file.originalname, //HERE 
            Body: file.buffer
        }

        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            // console.log("file uploaded succesfully")
            return resolve(data.Location)
        })
    })
}


const createUsers = async function (req, res) {
    try {

        let data = req.body

        let { fname, lname, email, phone, password, address } = data

        let files = req.files
        if (!files || files.length === 0) return res.status(400).send({ 
            status: false, 
            message: "No cover image found." 
        })

        let profileImage = await uploadFile(files[0])

        data.profileImage = profileImage

        //***********check if the body is empty**************//

        if (Object.keys(data).length === 0) {
            return res.status(400).send({
                status: false,
                message: "Body should  be not Empty please enter some data to create user"
            })
        }

        //<-------These validations for Mandatory fields--------->//

        if (!valid.isValid(fname)) {
            return res.status(400).send({ status: false, message: "fname is required" })
        }

        //validate name
        if (!valid.nameValidationRegex(fname)) {
            return res.status(400).send({ status: false, message: `fname contain only alphabets` })

        }
        if (!isNaN(fname)) {
            console.log(fname)
            return res.status(400).send({
                status: false,
                message: "fname can't be a number"
            })
        }

        if (!valid.isValid(lname)) {
            return res
                .status(400)
                .send({ status: false, msg: "lname field is mandatory" });
        }

        //validate name
        if (!valid.nameValidationRegex(lname)) {
            return res.status(400).send({ status: false, message: `lname contain only alphabets` })

        }
        if (!isNaN(lname)) {
            return res.status(400).send({
                status: false,
                message: "lname can't be a number"
            })
        }

        if (!valid.isValid(email)) {
            return res
                .status(400)
                .send({ status: false, msg: "email field is mandatory" });
        }

        if (await userModel.findOne({ email: email }))
            return res.status(400).send({ message: "Email is already exist" })

        if (!valid.emailValidationRegex(email)) {
            return res.status(400).send({ status: false, msg: "Enter valid email" })
        }

        if (!valid.isValid(profileImage)) {
            return res
                .status(400)
                .send({ status: false, msg: "profileImage field is mandatory" });
        }

        if (!valid.isValid(phone)) {
            return res
                .status(400)
                .send({ status: false, msg: "phone field is mandatory" });
        }

        if (await userModel.findOne({ phone: phone }))
            return res.status(400).send({ message: "Phone is already exist" })

        if (!valid.phoneValidationRegex(phone)) {
            return res.status(400).send({ 
                status: false, 
                msg: "Enter valid Phone No." 
            })
        }

        if (!valid.isValid(password)) {
            return res
                .status(400)
                .send({ status: false, msg: "password field is mandatory" });
        }

        if (!valid.isValid(address)) {
            return res
                .status(400)
                .send({ status: false, msg: "address field is mandatory" });
        }
        data.address = JSON.parse(data.address)

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt)
        data.password = hashedPass;

        const userCreated = await userModel.create(data)

        return res.status(201).send({ status: true, message: "User created successfully", data: userCreated })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//========================[ User Login ]======================================//

const userLogin = async function (req, res) {
    try {
        let data = req.body
       let { email , password } = data

        if (Object.keys(data).length == 0) {
            return res.status(400).send({
                status: false,
                message: "login credentials must be presents & only email and password should be inside body"
            })
        }

        if (!email) {
            return res.status(400).send({
                status: false,
                message: "email is required"
            })
        }
        if (!password) {
            return res.status(400).send({
                status: false,
                message: "password is required"
            })
        }
        if (!valid.passwordValidationRegex(password)) {
            return res.status(400).send({ 
                status: false, 
                message: `password shoud be minimum 8 to maximum 15 characters which contain at least one numeric digit, one uppercase and one lowercase letter` 
            })
        }


        let user = await userModel.findOne({ email: email })

        const compared = await bcrypt.compare(password, user.password);
        console.log(compared)

        if(!compared){
            return res.status(400).send({
                status: false,
                message: "password is incorrect"
            })
        }
        if (!user) return res.status(400).send({ status: false, msg: "please check your credentials" })

        let token = jwt.sign({
            userId: user._id,
            iat: new Date().getTime(),
            exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60
        }, "project-5",

        )

        return res.status(200).send({ status: true, msg: "User login successfull", data: { userId: user._id, token: token } })
    } catch (error) { return res.status(500).send({ status: false, msg: error.message }) }
}

//========================[ getUserById Api ]======================================//

const getUserById = async function (req, res) {
    try {

        userId = req.params.userId
        let getUser = await userModel.findOne({ userId })
        if (!getUser) {
            return res.status(404).send({
                status: false,
                message: "No user found"
            })
        }
        return res.status(200).send({
            status: true,
            message: "User profile details",
            data: getUser
        })
    }
    catch (err) {
        return res.status(500).send({
            status: false,
            message: err.message
        })
    }
}

//========================[ Start's User Update Api's ]======================================//

const updateUser = async function (req, res) {
    try {
        let userId = req.params.userId.trim()
        let data = req.body
        let { fname, lname, email, phone, password } = data

        if (!valid.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "User Id incorrect...." })
        }

        if (fname) {

            if (!valid.isValid(fname)) { return res.status(400).send({ status: false, msg: `${fname} please enter valid first name` }) }
            //validate name
            if (!valid.nameValidationRegex(fname)) {
                return res.status(400).send({ status: false, message: `fname contain only alphabets` })

            }
        }

        if (lname) {

            if (!valid.isValid(lname)) { return res.status(400).send({ status: false, msg: `${lname} please enter valid last name` }) }

            if (!/^[a-zA-Z -._\s]*$/.test(lname)) { return res.status(400).send({ status: false, msg: `${lname} is not valid` }) }
        }

        if (email) {
            if (!valid.isValid(email)) { return res.status(400).send({ status: false, msg: `${email} please enter valid email` }) }
        }

        if (!valid.emailValidationRegex(email)) {
            return res.status(400).send({ status: false, msg: "Enter valid Email" })
        }

        if (phone) {
            if (!/^[6789]\w{9}$/.test(phone)) { return res.status(400).send({ status: false, msg: "Accept only Acording to india" }) }
        }
        if (password) {
            if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}$/.test(password)) {
                return res.status(400).send({ status: false, message: `password shoud be minimum 8 to maximum 15 characters which contain at least one numeric digit, one uppercase and one lowercase letter` })
            }
        }
        let userUpdate = await userModel.findOneAndUpdate({ _id: userId }, { $set: data }, { new: true })
        // console.log(userUpdate)
        return res.status(200).send({ status: true, data: userUpdate })
    } catch (Err) {
        console.log(Err)
        res.status(500).send({ status: false, msg: Err.message })
    }

}
/*********************************** End User Update Api's*********************************/


module.exports = { userLogin, createUsers, getUserById, updateUser }

