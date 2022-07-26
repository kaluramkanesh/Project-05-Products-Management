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
           .send({ status: false, message: "fname field is mandatory" });
      }

      if(!valid.isValid(lname)){ 
        return res
           .status(400) 
           .send({ status: false, message: "lname field is mandatory" });
      }
      
      if(!valid.isValid(email)){ 
        return res
           .status(400)
           .send({ status: false, message: "email field is mandatory" });
      }
      if (await userModel.findOne({ email: email }))
            return res.status(400).send({status: false, message: "Email is already exist" })
        
        //validate email
        if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, message: `Email should be a valid email address` });
        }

      if(!valid.isValid(profileImage)){ 
        return res
           .status(400)
           .send({ status: false, message: "profileImage field is mandatory" });
      }

      if(!valid.isValid(phone)){ 
        return res
           .status(400)
           .send({ status: false, message: "phone field is mandatory" });
      }
      if (await userModel.findOne({ phone: phone }))
            return res.status(400).send({status: false, message: "phone is already exist" })

      if(!valid.isValid(password)){ 
        return res
           .status(400)
           .send({ status: false, message: "password field is mandatory" });
      }
      //password validation
      if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}$/.test(password)) {
        return res.status(400).send({ status: false, message: `password shoud be minimum 8 to maximum 15 characters which contain at least one numeric digit, one uppercase and one lowercase letter` })
    }  
      
      if(!valid.isValid(address)){ 
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


//******************user login***********

const userLogin = async function (req, res) {
    try {
        let value = req.body
        let userId = req.body.email;
        let password = req.body.password;

        //check data is exist | key exist in data
     if (Object.keys(value).length == 0) {
        return res.status(400).send({ status: false, message: "Data is required to login" })
    }

    //   console.log(password) 
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt)
        const compared = await bcrypt.compare(password, hashedPass);
        console.log(compared)
        bcrypt.hash(password, 10, function(err, hashedPass) { // Salt + Hash
            bcrypt.compare(password, hashedPass, function(err, result) {  // Compare
                // console.log(password)
                // console.log(hashedPass)
              // if passwords match
              if (result) {
                    console.log("It matches!")
              }
              // if passwords do not match
              else {
                    console.log("Invalid password!")
              }
            })
            
          })

        // *******empty attribute******

        // if (!isValid(userId) || !isValid(password)) return res.status(400).send({ status: false, msg: "Pls Provide  Email And Password both" })

        // console.log(password) 
        // const salt = await bcrypt.genSalt(10);
        // const hashedPass = await bcrypt.hash(password, salt)
        // const compared = await bcrypt.compare(password, hashedPass);
        // console.log(compared)

        // bcrypt.hash(password, 10, function(err, hashedPass) { // Salt + Hash
        //     bcrypt.compare(password, hashedPass, function(err, result) {  // Compare
        //         console.log(password)
        //         console.log(hashedPass)
        //       // if passwords match
        //       if (result) {
        //             console.log("It matches!")
        //       }
        //       // if passwords do not match
        //       else {
        //             console.log("Invalid password!")
        //       }
        //     })
            
        //   })
         
        // **empty attribute***

        // if (!isValid(userId) || !isValid(password)) return res.status(400).send({ status: false, msg: "Pls Provide  Email And Password both" })

        //email and password check from db
     let user = await userModel.findOne({ email: userId, password: password });
     console.log(user)
         if (!user)
        return res.status(400).send({ status: false, message: "credentials are not correct" });
       

        let token = jwt.sign({
            userId: user._id,
            iat: new Date().getTime(),
            exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60
        }, "project-5",
        
     )
    //  console.log(token)
    // res.setAuthorization.Bearer(token)
     return res.status(200).send({status: true , message : "succesfully created" , data: token.userId, token })
    } catch (error)
    {return res.status(500).send({status: false, message :error.message})}
}


module.exports.userLogin = userLogin
module.exports.createUsers = createUsers

