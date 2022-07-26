const mongoose= require("mongoose")

const isValid = function(value) {
    if(typeof (value) == "undefined" || typeof (value) == null) {return false}
    if(typeof (value) == "String" && (value).trim().length == 0) {return false}
    // if(typeof (value) == 'number' && (value).toString().trim().length == 0){return false}
    return true
}

const reg = function( value){
 return /^[A-Z , a-z]+$/.test(value)
}

const isValidObjectId = function (value){
    return mongoose.Types.ObjectId.isValid(value) 

}
const isValidString = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value !== "string" || value.trim().length === 0) return false 
    return true;
}

module.exports.isValid = isValid
module.exports.reg = reg
module.exports.isValidObjectId = isValidObjectId
module.exports.isValidString = isValidString