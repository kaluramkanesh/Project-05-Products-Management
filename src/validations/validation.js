const mongoose = require("mongoose")

const isValid = function (value) {
    if (typeof (value) == "undefined" || typeof (value) == null) {
        console.log("1")
        return false
    }

    if (typeof (value) == "string" && (value).trim().length == 0) {
        console.log("2")
        return false
    }

    return true
}

const isValidObjectId = function (value) {
    return mongoose.Types.ObjectId.isValid(value)

}

const nameValidationRegex = function (value) {
    return /^[a-zA-Z -._\s]*$/.test(value)
}

const emailValidationRegex = function (value) {
    return /^([0-9a-z]([-_\\.]*[0-9a-z]+)*)@([a-z]([-_\\.]*[a-z]+)*)[\\.]([a-z]{2,9})+$/.test(value)
}

const phoneValidationRegex = function (phone) {
    return /^[6789]\w{9}$/.test(phone)
}

const passwordValidationRegex = function (password) {
    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}$/.test(password)
}

const regPincode = function (value){
    return /^[1-9][0-9]{5}$/.test(value)
}


module.exports = { isValid, nameValidationRegex, isValidObjectId, emailValidationRegex, phoneValidationRegex, passwordValidationRegex, regPincode}



