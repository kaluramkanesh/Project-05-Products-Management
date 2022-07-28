const mongoose = require("mongoose")

const isValid = function (value) {
    if (typeof (value) == "undefined" || typeof (value) == null) { return false }
    console.log("Hello1", value)
    if (typeof (value) == "string" && (value).trim().length == 0) { return false }
    console.log("Hello2", value)
    if (typeof (value) == 'number' && (value).toString().trim().length == 0) { return false }
    console.log("Hello3", value)
    return true

}

const nameValidationRegex = function (value) {

    return /^[a-zA-Z -._\s]*$/.test(value)

}

const emailValidationRegex = function (email) {
    return /^([0-9a-z]([-_\\.]*[0-9a-z]+)*)@([a-z]([-_\\.]*[a-z]+)*)[\\.]([a-z]{2,9})+$/.test(email)
}

const isValidObjectId = function (value) {
    return mongoose.Types.ObjectId.isValid(value)

}

const phoneValidationRegex = function (phone) {
    return /^[6789]\w{9}$/.test(phone)
}

const passwordValidationRegex=function(password){
return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}$/.test(password)
}
module.exports = { isValid, nameValidationRegex, isValidObjectId, emailValidationRegex, phoneValidationRegex,passwordValidationRegex }
