const userModel = require("../Models/userModel")
const mongoose = require('mongoose')
const aws = require("aws-sdk")



const createBooks = async function (req, res) {
    try {

        const data = req.body
        // console.log(data)
        let { fname, lname, email, phone, password, address } = data
        // //check if the body is empty

        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, message: "Body should  be not Empty please enter some data to create user" })
        }

        //<-------These validations for Mandatory fields--------->//
        if (!(fname)) {
            return res
                .status(400)
                .send({ status: false, msg: "fname field is mandatory" });
        }

        if (!(lname)) {
            return res
                .status(400)
                .send({ status: false, msg: "lname field is mandatory" });
        }

        if (!(email)) {
            return res
                .status(400)
                .send({ status: false, msg: "email field is mandatory" });
        }

        // if (!(profileImage)) {
        //     return res
        //         .status(400)
        //         .send({ status: false, msg: "profileImage field is mandatory" });
        // }

        if (!(phone)) {
            return res
                .status(400)
                .send({ status: false, msg: "phone field is mandatory" });
        }

        if (!(password)) {
            return res
                .status(400)
                .send({ status: false, msg: "password field is mandatory" });
        }

        if (!(address)) {
            return res
                .status(400)
                .send({ status: false, msg: "address field is mandatory" });
        }

        let files = req.files
        // console.log(files)
        if (!files || files.length === 0) return res.status(400).send({ status: false, message: "No cover image found." })
        //upload to s3 and get the uploaded link
        let profileImage = await uploadFile(files[0])
        data.profileImage = profileImage
console.log(data.address["shipping"])
        let savedData = await userModel.create(data)
        res.status(201).send({
            status: true,
            data: savedData
        })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

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
            Key: "xyz/" + file.originalname, //HERE 
            Body: file.buffer
        }


        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            //  console.log(data)
            //  console.log("file uploaded succesfully")
            return resolve(data.Location)
        })

        // let data= await s3.upload( uploadParams)
        // if( data) return data.Location
        // else return "there is an error"

    })
}

module.exports.createBooks = createBooks