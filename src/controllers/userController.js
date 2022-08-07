const userModel = require("../Models/userModel")
const jwt = require("jsonwebtoken")
const valid = require("../validations/validation")
const bcrypt = require("bcrypt")
const aws = require("../util/aws")


//************create api of users */
const createUsers = async function (req, res) {
    try {

        let data = req.body

        let { fname, lname, email, phone, password, address } = data  // de

        //***********check if the body is empty**************//

        if (Object.keys(data).length == 0) {
            return res.status(400).send({
                status: false,
                message: "Body should  be not Empty please enter some data to create user"
            })
        }

        //<-------These validations for Mandatory fields--------->//

        if (!valid.isValid(fname)) {
            return res.status(400).send({ status: false, message: "fname field is mandatory" })
        }

        //validate name
        if (!valid.nameValidationRegex(fname)) {
            return res.status(400).send({
                status: false,
                message: `fname contain only alphabets`
            })
        }

        if (!valid.isValid(lname)) {
            return res.status(400).send({
                status: false,
                msg: "lname field is mandatory"
            });
        }

        //validate name
        if (!valid.nameValidationRegex(lname)) {
            return res.status(400).send({
                status: false,
                message: "lname contain only alphabets"
            })
        }

        if (!valid.isValid(email)) {
            return res.status(400).send({
                status: false,
                msg: "email field is mandatory"
            });
        }

        let checkEmail = await userModel.findOne({ email: email })
        if (checkEmail){
            return res.status(400).send({
                status: false,
                message: "Email is already exist in the DB"
            })
        }

        if (!valid.emailValidationRegex(email)) {
            return res.status(400).send({
                status: false,
                msg: "Enter valid email"
            })
        }

        let files = req.files
        if (!files || files.length == 0) return res.status(400).send({
            status: false, message: "user image is required and also insert user Image"
        })

        let profileImage = await aws.uploadFile(files[0])
        data.profileImage = profileImage

        if (!valid.isValid(phone)) {
            return res.status(400).send({
                status: false,
                msg: "phone field is mandatory"
            });
        }

        let checkPhone = await userModel.findOne({ phone: phone })
        if (checkPhone){
            return res.status(400).send({
                status: false,
                message: "phone is already exist in the DB"
            })
        }

        if (!valid.phoneValidationRegex(phone)) {
            return res.status(400).send({
                status: false,
                msg: "Please Enter valid Phone No. which is starts from 6,7,8,9"
            })
        }

        if (!valid.isValid(password)) {
            return res.status(400).send({
                status: false,
                msg: "password field is mandatory"
            });
        }

        //password validation
        if (!valid.passwordValidationRegex(password)) {
            return res.status(400).send({
                status: false,
                message: "password shoud be minimum 8 to maximum 15 characters which contain at least one numeric digit, one uppercase and one lowercase letter"
            })
        }

        if (!valid.isValid(address)) {
            return res.status(400).send({
                status: false,
                msg: "address field is mandatory"
            });
        }

        if (address == "") return res.status(400).send({ status: false, message: "Don't leave address Empty" })
        if (address) {

            if (!address || Object.keys(address).length === 0) {
                return res.status(400).send({ status: false, message: "Please enter address and it should be in object!!" })
            }

            let addresss = JSON.parse(address)

            const { shipping, billing } = addresss

            if (!valid.isValid(shipping)) {
                return res.status(400).send({
                    status: false,
                    msg: "shipping field is mandatory..."
                });
            }

            if (shipping) {
                const { street, city, pincode } = shipping

                if (!valid.isValid(street)) {
                    console.log(street)
                    return res.status(400).send({
                        status: false,
                        msg: "street field is mandatory..."
                    });
                }
                if (shipping.street) {

                    if (!valid.isValid(street)) {
                        return res.status(400).send({ status: false, message: "street is not valid" })
                    }
                    data["addresss.shipping.street"] = street
                }
                if (!valid.isValid(city)) {
                    return res.status(400).send({
                        status: false,
                        msg: "city field is mandatory"
                    });
                }

                if (shipping.city) {

                    if (!valid.nameValidationRegex(city)) return res.status(400).send({ status: false, message: "city name is not in valid format" })

                    data["addresss.shipping.city"] = city
                }
                if (!valid.isValid(pincode)) {
                    return res.status(400).send({
                        status: false,
                        msg: "pincode field is mandatory..."
                    });
                }

                if (shipping.pincode) {

                    if (!valid.regPincode(pincode)) return res.status(400).send({ status: false, message: "pincode is not in valid format" })
                    data["addresss.shipping.pincode"] = pincode
                }
            }

            if (!valid.isValid(billing)) {
                return res.status(400).send({
                    status: false,
                    msg: "billing field is mandatory..."
                });
            }
            if (billing) {
                const { street, city, pincode } = billing
                if (!valid.isValid(street)) {
                    console.log(street)
                    return res.status(400).send({
                        status: false,
                        msg: "street field is mandatory..."
                    });
                }

                if (billing.street) {
                    if (!valid.isValid(street)) return res.status(400).send({ status: false, message: "street is not valid" })
                    data["addresss.billing.street"] = street
                }

                if (!valid.isValid(city)) {
                    return res.status(400).send({
                        status: false,
                        msg: "city field is mandatory..."
                    });
                }

                if (billing.city) {

                    if (!valid.nameValidationRegex(city)) return res.status(400).send({ status: false, message: "city name is not in valid format" })
                    data["addresss.billing.city"] = city
                }

                if (!valid.isValid(pincode)) {
                    return res.status(400).send({
                        status: false,
                        msg: "pincode field is mandatory..."
                    });
                }

                if (billing.pincode) {

                    if (!valid.regPincode(pincode)) return res.status(400).send({ status: false, message: "pincode is not in valid format" })
                    data["addresss.billing.pincode"] = pincode
                }
            }
            data["address"] = addresss
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt)
        data.password = hashedPass;

        const userCreated = await userModel.create(data)

        return res.status(201).send({
            status: true,
            message: "User created successfully",
            data: userCreated
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
}


//========================[ User Login ]======================================//

const userLogin = async function (req, res) {
    try {
        let data = req.body
        let { email, password } = data

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
        if (!valid.emailValidationRegex(email)) {
            return res.status(400).send({
                status: false,
                message: "email is not valid , right format should look like : abc123@gmail.com"
            })
        }
        if (!password) {
            return res.status(400).send({
                status: false,
                message: "password is required"
            })
        }

        let user = await userModel.findOne({ email: email })
        if (!user) {
            return res.status(400).send({
                status: false,
                msg: "please check your email"
            })
        }
        let compared = await bcrypt.compare(password, user.password)

        if (!compared) {
            return res.status(400).send({
                status: false,
                message: "password is incorrect"
            })
        }

        let token = jwt.sign({
            userId: user._id,
            iat: new Date().getTime(),
            exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60
        }, "project-5",

        )

        return res.status(200).send({ status: true, msg: "User login successfull", data: { userId: user._id, token: token } })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
}

//========================[ getUserById Api ]======================================//

const getUserById = async function (req, res) {
    try {

        let userId = req.params.userId
        let getUser = await userModel.findById({ _id: userId  })
        if(!getUser){
            return res.status(404).send({
                status: false,
                message : "no data found with this userid"
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
        data = JSON.parse(JSON.stringify(data))
        let { fname, lname, email, phone, password, address } = data

        let obj = {};

        if (Object.keys(data).length == 0 && !req.files) {
            return res.status(400).send({
                status: false,
                msg: "For updating please put atleast one key"
            })
        }

        if (!valid.isValidObjectId(userId)) {
            return res.status(400).send({
                status: false,
                msg: "User Id incorrect"
            })
        }

        if (fname) {
            if (!valid.isValid(fname)) {
                return res.status(400).send({
                    status: false,
                    msg: "fname should be in string format and can't be a any white spaces",
                })
            }
            if (!valid.nameValidationRegex(fname)) {
                return res.status(400).send({
                    status: false,
                    message: `fname contain only alphabets`
                })
            }
            obj["fname"] = fname.trim().split(" ").filter(word => word).join(" ")
        }

        if (lname) {
            if (!valid.isValid(lname)) {
                return res.status(400).send({
                    status: false,
                    msg: "lname should be in string format and can't be a any white spaces",
                })
            }
            if (!valid.nameValidationRegex(lname)) {
                return res.status(400).send({
                    status: false,
                    msg: `lname is not valid`,
                })
            }
            obj["lnmae"] = lname.trim().split(" ").filter(word => word).join(" ")
        }

        if (email) {
            if (!valid.isValid(email)) {
                return res.status(400).send({
                    status: false,
                    msg: "lname should be in string format",
                })
            }
            if (!valid.emailValidationRegex(email)) {
                return res.status(400).send({
                    status: false,
                    msg: "Enter valid Email"
                })
            }
            obj["email"] = email
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(password, salt)
            if (!valid.passwordValidationRegex(password)) {
                return res.status(400).send({
                    status: false,
                    message: `password shoud be minimum 8 to maximum 15 characters which contain at least one numeric digit, one uppercase and one lowercase letter`
                })
            }
            obj["password"] = hashedPass.trim().split(" ").filter(word => word).join("")
        }

        let files = req.files
        if (data.hasOwnProperty("profileImage")) {
            if (!files || files.length == 0)
                return res.status(400).send({
                    status: false, message: "please insert profile image"
                })
        }
        if (files.length != 0 ) {
            let profileImage = await aws.uploadFile(files[0])
            obj["profileImage"] = profileImage
        }

        if (phone) {
            if (!valid.phoneValidationRegex(phone)) {
                return res.status(400).send({
                    status: false,
                    msg: "Please Enter valid Phone No. which is starts from 6,7,8,9"
                })
            }
            obj["phone"] = phone.trim().split(" ").filter(word => word).join("")
        }

        if (address == "") return res.status(400).send({ status: false, message: "Don't leave address Empty" })
        if (data.address) {

            if (!address || Object.keys(address).length === 0) {
                return res.status(400).send({ status: false, message: "Please enter address and it should be in object!!" })
            }

            let addresss = JSON.parse(address)

            const { shipping, billing } = addresss

            if (address.shipping) {

                const { street, city, pincode } = shipping

                if (shipping.street) {
                    if (!valid.isValid(street)) {
                        return res.status(400).send({ status: false, message: "street is not valid" })
                    }
                    obj["addresss.shipping.street"] = street
                }
                if (shipping.city) {
                    if (!valid.isValid(city)) return res.status(400).send({ status: false, message: "city is not valid" })
                    if (!valid.nameValidationRegex(city)) return res.status(400).send({ status: false, message: "city name is not in valid format" })
                    obj["addresss.shipping.city"] = city
                }
                if (shipping.pincode) {
                    if (!valid.isValid(pincode)) return res.status(400).send({ status: false, message: "pincode is not valid" })
                    if (!valid.regPincode(pincode)) return res.status(400).send({ status: false, message: "pincode is not in valid format" })
                    obj["addresss.shipping.pincode"] = pincode
                }
            }

            if (addresss.billing) {

                const { street, city, pincode } = billing

                if (billing.street) {
                    if (!valid.isValid(street)) return res.status(400).send({ status: false, message: "street is not valid" })
                    obj["addresss.billing.street"] = street
                }
                if (billing.city) {
                    if (!valid.isValid(city)) return res.status(400).send({ status: false, message: "city is not valid" })
                    if (!valid.nameValidationRegex(city)) return res.status(400).send({ status: false, message: "city name is not in valid format" })
                    obj["addresss.billing.city"] = city
                }
                if (billing.pincode) {
                    if (!valid.isValid(pincode)) return res.status(400).send({ status: false, message: "shipping pincode is not valid" })
                    if (!valid.regPincode(pincode)) return res.status(400).send({ status: false, message: "pincode is not in valid format" })
                    obj["addresss.billing.pincode"] = pincode
                }
            }
            obj["address"] = addresss
        }

        let updatedUser = await userModel.findOneAndUpdate({ _id: userId }, { $set: obj }, { new: true })
        if(!updatedUser){
            return res.status(404).send({
                status: false,
                message : "no data found with this userid"
            })
        }
        return res.status(200).send({ status: true, message: "User profile updated", data: updatedUser })
    } catch (Err) {
        return res.status(500).send({
            status: false,
            msg: Err.message
        })
    }

}

module.exports = { userLogin, createUsers, getUserById, updateUser }