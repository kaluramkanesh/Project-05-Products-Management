const mongoose= require("mongoose")

const isValid = function(value) {
    if(typeof (value) == "undefined" || typeof (value) == null) {return false}
    if(typeof (value) == "string" && (value).trim().length == 0) {return false}
    if(typeof (value) == 'number' && (value).toString().trim().length == 0){return false}
    return true
}

const reg = function( value){
 
 return /^[a-zA-Z -._\s]*$/.test(value)

}

const isValidObjectId = function (value){
    return mongoose.Types.ObjectId.isValid(value) 

}


module.exports.isValid = isValid
module.exports.reg = reg
module.exports.isValidObjectId = isValidObjectId