const express = require("express")
const mongoose = require("mongoose")
const multer = require('multer')
const bodyParser = require("body-parser")
const router = require("./routes/route")
const port = process.env.PORT || 3000
const app = express()

app.use(bodyParser.json())

app.use(multer({
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);

        } else {
            cb(null, false)
            return cb(new Error("BAD REQUEST"))
        }
    }
}).any());

app.use(function (e, req, res, next) {
    if (e.message == "BAD REQUEST")
        return res.status(400).send({ status: false, message: "profileImage should be Only .png, .jpg and .jpeg format allowed!" })
    next()
})

mongoose.connect("mongodb+srv://kaluram123:iKetOTUhK5vten7w@cluster0.4yhyg.mongodb.net/group44Database", {

})
    .then(() => console.log("MongoDB is connected successfully.."))
    .catch((Err) => console.log(Err))

app.use("/", router)

app.listen(port, function () {
    console.log(`Server is connected on Port ${port} ✅✅✅`)
})