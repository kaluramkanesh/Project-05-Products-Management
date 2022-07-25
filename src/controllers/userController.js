const userModel = require("../Models/userModel")
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const valid = require("../validations/validation")
const aws = require("aws-sdk")

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
        // console.log(files)
        if(!files || files.length === 0) return res.status(400).send({ status: false, message: "No cover image found." })
            //upload to s3 and get the uploaded link
        let profileImage= await uploadFile( files[0] )
        
       data.profileImage = profileImage 

        // //check if the body is empty
        
        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, message: "Body should  be not Empty please enter some data to create user" })
        }
        
         //<-------These validations for Mandatory fields--------->//
     if(!valid.isValid(fname)){ 
        return res
           .status(400)
           .send({ status: false, msg: "fname field is mandatory" });
      }

      if(!valid.isValid(lname)){ 
        return res
           .status(400) 
           .send({ status: false, msg: "lname field is mandatory" });
      }
      
      if(!valid.isValid(email)){ 
        return res
           .status(400)
           .send({ status: false, msg: "email field is mandatory" });
      }

      if(!valid.isValid(profileImage)){ 
        return res
           .status(400)
           .send({ status: false, msg: "profileImage field is mandatory" });
      }

      if(!valid.isValid(phone)){ 
        return res
           .status(400)
           .send({ status: false, msg: "phone field is mandatory" });
      }

      if(!valid.isValid(password)){ 
        return res
           .status(400)
           .send({ status: false, msg: "password field is mandatory" });
      }
      
      if(!valid.isValid(address)){ 
        return res
           .status(400)
           .send({ status: false, msg: "address field is mandatory" });
      } 

    const userCreated = await userModel.create(data)

       return res.status(201).send({ status: true, message: "User created successfully", data: userCreated })
    }

    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}


//******************user login***********

const userLogin = async function (req, res) {
    try {
        let value = req.body
        let userId = value.email
        console.log(userId)

        let password = value.password


        // *******empty attribute******

        // if (!isValid(userId) || !isValid(password)) return res.status(400).send({ status: false, msg: "Pls Provide  Email And Password both" })

        let user = await userModel.findOne({ $and: [{ email: userId, password: password }] })
        console.log(user)
        if (!user) return res.status(400).send({ status: false, msg: "The email or password you are using is wrong" })

        let token = jwt.sign({
            userId: user._id.toString(),
            iat: new Date().getTime(),
            exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60
        }, "project-5",
        
     )
     console.log(token)
        return res.status(200).send({status: true , msg : "succesfully created" , data: token })
    } catch (error)
    {return res.status(500).send({status: false, msg :error.message})}
}


module.exports.userLogin = userLogin
module.exports.createUsers = createUsers

